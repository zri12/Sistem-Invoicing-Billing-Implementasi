<?php

namespace App\Services;

use App\Models\Company;
use App\Models\Invoice;
use App\Models\InvoiceTemplateSetting;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoicePdfService
{
    public function output(Invoice $invoice): string
    {
        $invoice->loadMissing(['client', 'paymentAccount', 'items']);
        $company = $this->company();
        $template = $this->template();
        $viewPath = resource_path('views/pdf/invoice.blade.php');

        $fingerprint = hash('sha256', json_encode([
            // Naikkan versi ini bila struktur visual PDF berubah. Cache Dompdf
            // lama pada shared hosting tidak boleh kembali terkirim sesudah deploy.
            'corporate-invoice-layout-v9',
            $invoice->toArray(),
            $company->toArray(),
            $template->toArray(),
            $this->assetFingerprint($company),
            is_file($viewPath) ? filemtime($viewPath) : null,
            is_file(__FILE__) ? filemtime(__FILE__) : null,
            $this->fontFingerprint(),
        ], JSON_UNESCAPED_UNICODE));
        $cacheDirectory = storage_path('app/dompdf/cache');
        $cachePath = $cacheDirectory.'/'.$invoice->getKey().'-'.$fingerprint.'.pdf';

        if (!is_dir($cacheDirectory)) {
            @mkdir($cacheDirectory, 0755, true);
        }

        if ($cached = $this->cachedPdf($cachePath)) {
            return $cached;
        }

        // Warm-up preview dan klik download dapat datang hampir bersamaan.
        // Lock per invoice mencegah Dompdf merender file identik dua kali.
        $lock = @fopen($cacheDirectory.'/'.$invoice->getKey().'.lock', 'c');
        if ($lock) {
            @flock($lock, LOCK_EX);
            if ($cached = $this->cachedPdf($cachePath)) {
                @flock($lock, LOCK_UN);
                fclose($lock);

                return $cached;
            }
        }

        try {
            $bytes = $this->render($invoice)->output();
            if (is_writable($cacheDirectory)) {
                $temporaryPath = $cachePath.'.'.getmypid().'.tmp';
                file_put_contents($temporaryPath, $bytes, LOCK_EX);
                @rename($temporaryPath, $cachePath);

                // Sisakan hanya versi terbaru invoice ini agar storage cache tidak
                // terus membesar setiap kali invoice atau template diperbarui.
                foreach (glob($cacheDirectory.'/'.$invoice->getKey().'-*.pdf') ?: [] as $oldCachePath) {
                    if ($oldCachePath !== $cachePath) {
                        @unlink($oldCachePath);
                    }
                }
            }

            return $bytes;
        } finally {
            if ($lock) {
                @flock($lock, LOCK_UN);
                fclose($lock);
            }
        }
    }

    public function render(Invoice $invoice)
    {
        $invoice->loadMissing(['client', 'paymentAccount', 'items']);

        $company = $this->company();
        $template = $this->template();

        // Dompdf tidak mendukung setiap format gambar browser (mis. WebP/HEIC).
        // Gambar yang tidak dapat dibaca diabaikan agar PDF tetap diterbitkan.
        $logoPath = $this->optimizedImage($this->pdfImagePath($company->logo_path), 500, 150);
        $stampSource = $this->pdfImagePath($company->stamp_path) ?: $logoPath;
        $stampPath = $this->optimizedImage($stampSource, 500, 160, true);
        $signatureSource = $this->pdfImagePath($company->signature_path);
        $signaturePath = $this->optimizedImage($signatureSource, 240, 225);
        $signatureFramePath = $this->signatureFrameImage(
            $stampSource,
            $signatureSource,
            (bool) $template->show_stamp,
            (bool) $template->show_signature,
        );

        $pdf = Pdf::setOption($this->dompdfOptions())->loadView('pdf.invoice', [
            'invoice' => $invoice,
            'company' => $company,
            'template' => $template,
            'logoPath' => $logoPath,
            // Cap tanpa unggahan khusus memakai logo perusahaan versi abu-abu.
            'stampPath' => $stampPath,
            'signaturePath' => $signaturePath,
            'signatureFramePath' => $signatureFramePath,
        ])->setPaper('a4', 'portrait');

        $this->registerCorporateFonts($pdf);

        return $pdf;
    }

    /**
     * Cadangan untuk shared hosting yang tidak dapat mendaftarkan font Dompdf.
     * Tetap gunakan template perusahaan; hanya lewati optimasi gambar dan
     * pendaftaran font agar hasilnya tidak pernah berubah menjadi PDF Courier.
     */
    public function renderResilient(Invoice $invoice)
    {
        $invoice->loadMissing(['client', 'paymentAccount', 'items']);

        $company = $this->company();
        $template = $this->template();
        $logoPath = $this->pdfImagePath($company->logo_path);
        $stampPath = $this->pdfImagePath($company->stamp_path) ?: $logoPath;
        $signaturePath = $this->pdfImagePath($company->signature_path);
        $signatureFramePath = $this->signatureFrameImage(
            $stampPath,
            $signaturePath,
            (bool) $template->show_stamp,
            (bool) $template->show_signature,
        );

        return Pdf::setOption($this->dompdfOptions())->loadView('pdf.invoice', [
            'invoice' => $invoice,
            'company' => $company,
            'template' => $template,
            'logoPath' => $logoPath,
            'stampPath' => $stampPath,
            'signaturePath' => $signaturePath,
            'signatureFramePath' => $signatureFramePath,
        ])->setPaper('a4', 'portrait');
    }

    /**
     * PDF teks mandiri sebagai jalan terakhir untuk hosting shared yang tidak
     * dapat menjalankan Dompdf. Tidak memakai gambar ataupun library eksternal.
     */
    public function renderPlainPdf(Invoice $invoice): string
    {
        $invoice->loadMissing(['client', 'paymentAccount', 'items']);
        $company = $this->company();
        $client = $invoice->client;
        $account = $invoice->paymentAccount;

        $lines = [
            $company->name,
            $company->address ?: '',
            trim(($company->phone ?: '').' '.($company->email ?: '')),
            '',
            'INVOICE',
            'No. '.$invoice->invoice_number,
            '',
            'Invoice Name: '.$invoice->invoice_name,
            'Invoice Date: '.$invoice->invoice_date,
            'Due Date: '.$invoice->due_date,
            '',
            'Bill To: '.($client?->name ?: '-'),
            $client?->address ?: '',
            $client?->phone ?: ($client?->email ?: ''),
            '',
            'ITEM DESCRIPTION                                      PRICE       QTY        TOTAL',
            str_repeat('-', 86),
        ];

        foreach ($invoice->items as $item) {
            $description = $item->description ?: $item->product_name;
            $lines[] = sprintf(
                '%-52s %12s %7s %12s',
                $this->truncatePdfText($description, 52),
                'Rp '.number_format((float) $item->price, 0, ',', '.'),
                rtrim(rtrim(number_format((float) $item->qty, 2, '.', ''), '0'), '.'),
                'Rp '.number_format((float) $item->total, 0, ',', '.')
            );
        }

        $lines = array_merge($lines, [
            str_repeat('-', 86),
            'Subtotal: Rp '.number_format((float) $invoice->subtotal, 0, ',', '.'),
            'Discount: Rp '.number_format((float) $invoice->discount, 0, ',', '.'),
            'TOTAL DUE: Rp '.number_format((float) $invoice->total, 0, ',', '.'),
            '',
            'Payment Method: '.($account?->name ?: '-').' '.($account?->account_number ?: ''),
            $account?->account_holder ?: '',
            '',
            ($company->signing_city ?: '-').', '.$invoice->invoice_date,
            $company->signer_name ?: '',
            $company->signer_title ?: '',
        ]);

        $pages = array_chunk(array_values(array_filter($lines, static fn ($line) => $line !== null)), 52);
        $objects = ['<< /Type /Catalog /Pages 2 0 R >>'];
        $pageObjectNumbers = [];
        $nextObject = 3;

        foreach ($pages as $_page) {
            $pageObjectNumbers[] = $nextObject;
            $nextObject += 2;
        }

        $objects[] = '<< /Type /Pages /Kids ['.implode(' ', array_map(static fn ($number) => $number.' 0 R', $pageObjectNumbers)).'] /Count '.count($pages).' >>';
        $fontObject = $nextObject;

        foreach ($pages as $index => $pageLines) {
            $pageObject = $pageObjectNumbers[$index];
            $contentObject = $pageObject + 1;
            $stream = $this->plainPdfStream($pageLines);
            $objects[$pageObject - 1] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 '.$fontObject.' 0 R >> >> /Contents '.$contentObject.' 0 R >>';
            $objects[$contentObject - 1] = '<< /Length '.strlen($stream).' >>'."\nstream\n".$stream."\nendstream";
        }

        $objects[$fontObject - 1] = '<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>';

        $pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
        $offsets = [0];
        foreach ($objects as $number => $object) {
            $offsets[$number + 1] = strlen($pdf);
            $pdf .= ($number + 1)." 0 obj\n".$object."\nendobj\n";
        }

        $xrefOffset = strlen($pdf);
        $pdf .= 'xref'."\n0 ".(count($objects) + 1)."\n0000000000 65535 f \n";
        for ($number = 1; $number <= count($objects); $number++) {
            $pdf .= sprintf('%010d 00000 n ', $offsets[$number])."\n";
        }

        return $pdf.'trailer << /Size '.(count($objects) + 1).' /Root 1 0 R >>'."\nstartxref\n".$xrefOffset."\n%%EOF";
    }

    private function plainPdfStream(array $lines): string
    {
        $stream = "BT\n/F1 9 Tf\n11 TL\n42 800 Td\n";

        foreach ($lines as $line) {
            $stream .= '('.$this->escapePdfText((string) $line).") Tj\nT*\n";
        }

        return $stream.'ET';
    }

    private function escapePdfText(string $value): string
    {
        $value = preg_replace('/[^\\x20-\\x7E]/', '?', $value) ?: '';

        return str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $value);
    }

    private function truncatePdfText(?string $value, int $length): string
    {
        $value = $value ?: '';

        return strlen($value) > $length ? substr($value, 0, $length - 3).'...' : $value;
    }

    private function pdfImagePath(?string $relativePath): ?string
    {
        if (!$relativePath) {
            return null;
        }

        $path = storage_path('app/public/'.$relativePath);
        $imageInfo = is_file($path) ? @getimagesize($path) : false;
        $supportedTypes = [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_GIF];

        return $imageInfo && in_array($imageInfo[2], $supportedTypes, true) ? $path : null;
    }

    private function cachedPdf(string $path): ?string
    {
        if (!is_file($path)) {
            return null;
        }

        $bytes = file_get_contents($path);

        return $bytes !== false && str_starts_with($bytes, '%PDF-') ? $bytes : null;
    }

    private function assetFingerprint(Company $company): array
    {
        return array_map(function (?string $relativePath) {
            $path = $relativePath ? storage_path('app/public/'.$relativePath) : null;

            return $path && is_file($path) ? [$relativePath, filesize($path), filemtime($path)] : null;
        }, [$company->logo_path, $company->stamp_path, $company->signature_path]);
    }

    private function fontFingerprint(): array
    {
        return array_map(function (string $filename) {
            $path = public_path('fonts/'.$filename);

            return is_file($path) ? [$filename, filesize($path), filemtime($path)] : null;
        }, [
            'tamil-sangam-mn-pdf.ttf',
            'tamil-sangam-mn-pdf-bold.ttf',
            'pt-sans-regular.ttf',
            'pt-sans-bold.ttf',
        ]);
    }

    private function optimizedImage(?string $sourcePath, int $maxWidth, int $maxHeight, bool $grayscale = false): ?string
    {
        if (!$sourcePath || !extension_loaded('gd')) {
            return $sourcePath;
        }

        $info = @getimagesize($sourcePath);
        if (!$info) {
            return $sourcePath;
        }

        $assetDirectory = storage_path('app/dompdf/assets');
        if (!is_dir($assetDirectory)) {
            @mkdir($assetDirectory, 0755, true);
        }

        $cachePath = $assetDirectory.'/'.hash('sha256', implode('|', [
            $sourcePath,
            filesize($sourcePath),
            filemtime($sourcePath),
            $maxWidth,
            $maxHeight,
            (int) $grayscale,
        ])).'.png';
        if (is_file($cachePath)) {
            return $cachePath;
        }

        $source = match ($info[2]) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($sourcePath),
            IMAGETYPE_PNG => @imagecreatefrompng($sourcePath),
            IMAGETYPE_GIF => @imagecreatefromgif($sourcePath),
            default => false,
        };
        if (!$source) {
            return $sourcePath;
        }

        $scale = min(1, $maxWidth / $info[0], $maxHeight / $info[1]);
        $width = max(1, (int) round($info[0] * $scale));
        $height = max(1, (int) round($info[1] * $scale));
        $target = imagecreatetruecolor($width, $height);
        imagealphablending($target, false);
        imagesavealpha($target, true);
        $transparent = imagecolorallocatealpha($target, 255, 255, 255, 127);
        imagefill($target, 0, 0, $transparent);
        imagecopyresampled($target, $source, 0, 0, 0, 0, $width, $height, $info[0], $info[1]);
        if ($grayscale) {
            imagefilter($target, IMG_FILTER_GRAYSCALE);
            imagefilter($target, IMG_FILTER_CONTRAST, -18);
        }

        $written = @imagepng($target, $cachePath, 6);
        imagedestroy($source);
        imagedestroy($target);

        return $written ? $cachePath : $sourcePath;
    }

    /**
     * Browser menggabungkan cap dan tanda tangan pada satu area. Dompdf
     * menghitung `object-fit` dan transform CSS secara berbeda sehingga hasil
     * unduhan sebelumnya tampak tidak sama. Buat satu raster final berukuran
     * area cap preview agar kedua gambar selalu punya komposisi yang identik.
     */
    private function signatureFrameImage(?string $stampSource, ?string $signatureSource, bool $showStamp, bool $showSignature): ?string
    {
        if (!extension_loaded('gd') || (!$showStamp && !$showSignature)) {
            return null;
        }

        $sources = array_filter(
            [$showStamp ? $stampSource : null, $showSignature ? $signatureSource : null],
            static fn (?string $source): bool => $source !== null && is_file($source),
        );
        if (!$sources) {
            return null;
        }

        $assetDirectory = storage_path('app/dompdf/assets');
        if (!is_dir($assetDirectory)) {
            @mkdir($assetDirectory, 0755, true);
        }

        $fingerprint = [];
        foreach ($sources as $source) {
            $fingerprint[] = is_file($source) ? [$source, filesize($source), filemtime($source)] : null;
        }
        $cachePath = $assetDirectory.'/'.hash('sha256', json_encode([
            'corporate-signature-frame-v2', $fingerprint, $showStamp, $showSignature,
        ])).'.png';
        if (is_file($cachePath)) {
            return $cachePath;
        }

        $frame = imagecreatetruecolor(225, 96);
        imagealphablending($frame, false);
        imagesavealpha($frame, true);
        $transparent = imagecolorallocatealpha($frame, 255, 255, 255, 127);
        imagefill($frame, 0, 0, $transparent);
        imagealphablending($frame, true);

        if ($showStamp && $stampSource && ($stampInfo = @getimagesize($stampSource)) && ($stamp = $this->gdImage($stampSource, $stampInfo[2]))) {
            imagefilter($stamp, IMG_FILTER_GRAYSCALE);
            imagefilter($stamp, IMG_FILTER_CONTRAST, -18);
            // Cap memenuhi seluruh area 225 x 60 px, sama dengan preview dan
            // tanpa garis bingkai tambahan pada dokumen.
            $scale = min(225 / $stampInfo[0], 60 / $stampInfo[1]);
            $width = max(1, (int) round($stampInfo[0] * $scale));
            $height = max(1, (int) round($stampInfo[1] * $scale));
            imagecopyresampled($frame, $stamp, (int) round((225 - $width) / 2), (int) round((60 - $height) / 2), 0, 0, $width, $height, $stampInfo[0], $stampInfo[1]);
            imagedestroy($stamp);
        }

        if ($showSignature && $signatureSource && ($signatureInfo = @getimagesize($signatureSource)) && ($signature = $this->gdImage($signatureSource, $signatureInfo[2]))) {
            // 58px × scale(1.65) dari preview = 96px; lebar tetap proporsional.
            $height = 96;
            $width = max(1, (int) round($signatureInfo[0] * ($height / $signatureInfo[1])));
            imagecopyresampled($frame, $signature, (int) round((225 - $width) / 2), 0, 0, 0, $width, $height, $signatureInfo[0], $signatureInfo[1]);
            imagedestroy($signature);
        }

        $written = @imagepng($frame, $cachePath, 6);
        imagedestroy($frame);

        return $written ? $cachePath : null;
    }

    private function gdImage(string $path, int $type)
    {
        return match ($type) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($path),
            IMAGETYPE_PNG => @imagecreatefrompng($path),
            IMAGETYPE_GIF => @imagecreatefromgif($path),
            default => false,
        };
    }

    private function dompdfOptions(): array
    {
        // Shared hosting sering membatasi direktori temporary sistem (/tmp).
        // Gunakan storage Laravel yang sudah wajib writable pada cPanel.
        $directory = storage_path('app/dompdf');
        if (!is_dir($directory)) {
            @mkdir($directory, 0755, true);
        }

        return [
            'tempDir' => $directory,
            'fontDir' => $directory,
            'fontCache' => $directory,
            // PDF membaca logo/cap dari storage aplikasi dan watermark dari
            // document root domain; keduanya adalah lokasi lokal yang sah.
            'chroot' => [base_path(), public_path()],
            'isRemoteEnabled' => false,
        ];
    }

    /**
     * Register local TrueType files before Dompdf parses the template. This
     * avoids remote URLs and guarantees the same font family on cPanel.
     */
    private function registerCorporateFonts($pdf): void
    {
        $fontMetrics = $pdf->getDomPDF()->getFontMetrics();
        $fonts = [
            ['family' => 'Tamil Sangam MN PDF', 'weight' => 'normal', 'path' => public_path('fonts/tamil-sangam-mn-pdf.ttf')],
            // A TrueType bold companion keeps labels out of Dompdf's fallback
            // font while preserving the Tamil Sangam MN visual family.
            ['family' => 'Tamil Sangam MN PDF', 'weight' => 'bold', 'path' => public_path('fonts/tamil-sangam-mn-pdf-bold.ttf')],
            ['family' => 'PT Sans PDF', 'weight' => 'normal', 'path' => public_path('fonts/pt-sans-regular.ttf')],
            ['family' => 'PT Sans PDF', 'weight' => 'bold', 'path' => public_path('fonts/pt-sans-bold.ttf')],
        ];

        foreach ($fonts as $font) {
            if (!is_file($font['path'])) {
                continue;
            }

            try {
                $fontMetrics->registerFont([
                    'family' => $font['family'],
                    'style' => 'normal',
                    'weight' => $font['weight'],
                ], $font['path']);
            } catch (\Throwable $exception) {
                // Sebagian konfigurasi shared-hosting menolak menulis cache
                // font Dompdf. Jangan sampai masalah font mengubah hasilnya
                // menjadi PDF teks darurat; Dompdf tetap dapat merender layout
                // perusahaan dengan font fallback-nya.
                report($exception);
            }
        }
    }

    private function company(): Company
    {
        return Company::query()->first()
            ?? Company::create(['name' => 'PT. Ruang Kreasi Aplikasi'])->refresh();
    }

    private function template(): InvoiceTemplateSetting
    {
        // refresh() penting pada record baru agar nilai default database
        // (semua elemen template aktif) langsung tersedia pada render pertama.
        return InvoiceTemplateSetting::query()->first()
            ?? InvoiceTemplateSetting::create([])->refresh();
    }
}
