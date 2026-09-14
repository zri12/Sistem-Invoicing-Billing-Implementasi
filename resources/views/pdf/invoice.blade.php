<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>{{ $invoice->invoice_number }}</title>
<style>
    @page { margin: 13mm 20mm; }
    body { font-family: 'Tamil Sangam MN PDF', serif; font-size: 11.04pt; color: #171717; }
    table { border-collapse: collapse; }
    .bg-watermark { position: fixed; top: -60px; left: -76px; width: 210mm; height: 297mm; z-index: -1; }
    .bg-watermark img { width: 100%; height: 100%; }
    .bg-watermark-bottom { transform: rotate(180deg); }
    .accent { position: fixed; width: 12px; background: #626ca8; }
    .accent-mid { background: #d9e1f3; }
    .accent-light { background: #ebeff8; }
    .accent-tr-1 { top: -60px; right: -76px; height: 74px; }
    .accent-tr-2 { top: 14px; right: -76px; height: 63px; }
    .accent-tr-3 { top: 77px; right: -76px; height: 62px; }
    .accent-bl-1 { bottom: -60px; left: -76px; height: 74px; }
    .accent-bl-2 { bottom: 14px; left: -76px; height: 63px; }
    .accent-bl-3 { bottom: 77px; left: -76px; height: 62px; }
    .header { width: 100%; }
    .logo { height: 46px; }
    /* Seluruh ujung kanan header mengikuti garis kanan tabel: n/d pada
       tagline dan E/angka terakhir nomor invoice selalu sejajar. */
    .tagline { text-align: right; }
    .tagline p.title { margin: 0; color: #172033; font-family: 'PT Sans PDF', sans-serif; font-size: 12pt; font-weight: bold; white-space: nowrap; }
    .tagline p.contact { position: relative; top: -7px; font-family: 'PT Sans PDF', sans-serif; font-size: 7.92pt; color: #777; margin: 2px 0 0; white-space: nowrap; }
    .info-section { width: 100%; margin-top: 49px; }
    .info-left { width: 55%; vertical-align: top; }
    .info-left p { margin: 0 0 6px; }
    .info-right { width: 45%; text-align: right; vertical-align: top; }
    .info-right-content { position: relative; top: -3px; text-align: right; }
    .info-right-content .doc-title { text-align: right; }
    .info-right-content p { margin: 4px 0 0; text-align: right; }
    .doc-title { font-size: 10.08pt; font-weight: bold; }
    .label { display: inline-block; width: 124px; font-weight: bold; }
    .bill-section { width: 100%; margin-top: 14px; }
    .bill-left { width: 50%; vertical-align: top; }
    .bill-left p { margin: 4pt 0 0; line-height: 1.05; }
    .bill-right { width: 50%; vertical-align: top; padding-left: 7px; }
    .bill-right p { margin: 4pt 0 0; }
    table.items { width: 100%; margin-top: 57px; }
    table.items th, table.items td { border: 1px solid #7b7b7b; padding: 2px 8px; }
    table.items th { background: #f4f4f4; text-align: center; }
    table.items td.desc { text-align: left; }
    table.items td.num { text-align: right; }
    table.items td.center { text-align: center; }
    .totals { width: 100%; margin-top: 1px; }
    .totals table { width: 52%; margin-left: 48%; }
    .totals td { padding: 5px 0; }
    .totals td.value { text-align: right; }
    .totals tr.total td { border-top: 1px solid #565656; font-size: 11.04pt; font-weight: bold; padding-top: 14px; }
    .payment-section { margin-top: 44px; width: 74%; }
    /* Posisi tanda tangan mengikuti template perusahaan dan tidak ikut terdorong
       oleh panjang deskripsi item, sehingga selalu utuh pada satu halaman A4. */
    .signature-section { position: fixed; right: 0; bottom: 134px; width: 100%; }
    .signature-box { width: 240px; text-align: center; margin-left: auto; }
    .signature-frame { position: relative; width: 225px; height: 60px; margin: 8px auto; text-align: center; overflow: visible; }
    .signature-frame .stamp-artwork { position: absolute; top: 0; left: 0; width: 225px; height: 60px; object-fit: contain; filter: grayscale(1) contrast(1.25); }
    /* Preview browser menampilkan file TTD pada tinggi 58 px, lalu
       translateY(14 px) dan scale(1.65). Dompdf tidak menghitung kombinasi
       transform itu sama persis, sehingga nilainya ditulis sebagai ukuran akhir
       (103 x 96 px) dan posisi ekuivalen di tengah bingkai. */
    .signature-frame .signature-artwork { position: absolute; top: -4px; left: 61px; width: 103px; height: 96px; object-fit: contain; z-index: 2; }
    .signature-frame .signature-frame-artwork { position: absolute; top: -4px; left: 0; width: 225px; height: 96px; z-index: 2; }
    .signature-box > p:first-child { position: relative; top: 8pt; }
    .footer { position: fixed; right: 0; bottom: -6px; left: 0; margin: 0; font-size: 10.08pt; }
</style>
</head>
<body>
    <div class="bg-watermark"><img src="{{ str_replace('\\', '/', public_path('images/invoice/bg-invoice.png')) }}"></div>
    <div class="bg-watermark bg-watermark-bottom"><img src="{{ str_replace('\\', '/', public_path('images/invoice/bg-invoice.png')) }}"></div>
    <i class="accent accent-tr-1"></i>
    <i class="accent accent-mid accent-tr-2"></i>
    <i class="accent accent-light accent-tr-3"></i>
    <i class="accent accent-bl-1"></i>
    <i class="accent accent-mid accent-bl-2"></i>
    <i class="accent accent-light accent-bl-3"></i>
    <table class="header">
        <tr>
            <td style="width: 40%;">
                @if($template->show_logo && $logoPath)
                    <img class="logo" src="{{ $logoPath }}">
                @endif
            </td>
            <td class="tagline" style="width: 60%;">
                @if($template->show_tagline)
                    <p class="title">{{ $company->tagline }}</p>
                    <p class="contact">Website: {{ $company->website }} | Email: {{ $company->email }}</p>
                @endif
            </td>
        </tr>
    </table>

    <table class="info-section">
        <tr>
            <td class="info-left">
                <p><span class="label">Invoice Name</span>: {{ $invoice->invoice_name }}</p>
                @if($template->show_invoice_date)
                <p><span class="label">Invoice Date</span>: {{ \Carbon\Carbon::parse($invoice->invoice_date)->translatedFormat('d F Y') }}</p>
                @endif
                @if($template->show_due_date)
                <p><span class="label">Due Date</span>: {{ \Carbon\Carbon::parse($invoice->due_date)->translatedFormat('d F Y') }}</p>
                @endif
            </td>
            <td class="info-right">
                <div class="info-right-content">
                    @if($template->show_title)<div class="doc-title">{{ $template->title }}</div>@endif
                    @if($template->show_number)<p>No. {{ $invoice->invoice_number }}</p>@endif
                </div>
            </td>
        </tr>
    </table>

    <table class="bill-section">
        <tr>
            <td class="bill-left">
                @if($template->show_client)
                <b>Bill To:</b>
                <p>{{ $invoice->client->name }}<br>
                {{ $invoice->client->address }}<br>
                @if($invoice->client->phone) {{ $invoice->client->phone }} @else {{ $invoice->client->email }} @endif
                </p>
                @endif
            </td>
            <td class="bill-right">
                <b>Total Due:</b>
                <p style="font-size: 11.04pt;">Rp. {{ number_format($invoice->total, 0, ',', '.') }}</p>
            </td>
        </tr>
    </table>

    @if($template->show_items)
    <table class="items">
        <thead>
            <tr>
                <th>Item Description</th>
                <th style="width: 19%;">Price</th>
                <th style="width: 12%;">Qty</th>
                <th style="width: 21%;">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($invoice->items as $item)
            <tr>
                <td class="desc">{{ $item->description ?: $item->product_name }}</td>
                <td class="num">Rp. {{ number_format($item->price, 0, ',', '.') }}</td>
                <td class="center">{{ rtrim(rtrim(number_format($item->qty, 2, '.', ''), '0'), '.') }}</td>
                <td class="num">Rp. {{ number_format($item->total, 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    <div class="totals">
        <table>
            @if($template->show_subtotal)
            <tr><td><b>Subtotal</b></td><td class="value">Rp. {{ number_format($invoice->subtotal, 0, ',', '.') }}</td></tr>
            @endif
            @if($template->show_discount)
            <tr><td><b>Discount</b></td><td class="value">Rp. {{ number_format($invoice->discount, 0, ',', '.') }}</td></tr>
            @endif
            @if($template->show_total)
            <tr class="total"><td><b>Total Due</b></td><td class="value"><b>Rp. {{ number_format($invoice->total, 0, ',', '.') }}</b></td></tr>
            @endif
        </table>
    </div>

    <div class="payment-section">
        @if($template->show_bank_info)
        <b>Payment Method:</b>
        <p style="font-weight: bold; margin: 4px 0 0;">{{ $invoice->paymentAccount->name }} {{ $invoice->paymentAccount->account_number }}</p>
        <p style="margin: 0;">{{ $invoice->paymentAccount->account_holder ?: $company->name }}</p>
        @if($invoice->paymentAccount->branch)<p style="margin: 0;">{{ $invoice->paymentAccount->branch }}</p>@endif
        @endif
        @if($template->show_terms)
        <div style="margin-top: 28px;">
            <b>Terms &amp; Condition:</b>
            <ul style="margin: 11px 0 0; padding-left: 16px;">
                <li>{{ $invoice->payment_terms ?: 'Silakan lakukan pembayaran ke rekening yang tertera di atas.' }}</li>
                <li>Mohon konfirmasi pembayaran melalui email balasan pada email tagihan ini.</li>
            </ul>
        </div>
        @endif
    </div>

    @if($template->show_stamp || $template->show_signature)
    <div class="signature-section">
        <div class="signature-box">
            <p>{{ $company->signing_city ?: '-' }}, {{ \Carbon\Carbon::parse($invoice->invoice_date)->translatedFormat('d F Y') }}</p>
            <div class="signature-frame">
                @if($signatureFramePath)
                    <img class="signature-frame-artwork" src="{{ $signatureFramePath }}">
                @else
                    @if($template->show_stamp && $stampPath)<img class="stamp-artwork" src="{{ $stampPath }}">@endif
                    @if($template->show_signature && $signaturePath)<img class="signature-artwork" src="{{ $signaturePath }}">@endif
                @endif
            </div>
            @if($template->show_signer_name)<p style="font-weight: bold; margin: 18px 0 0;">{{ $company->signer_name }}</p>@endif
            @if($template->show_signer_position)<p style="margin: 0;">{{ $company->signer_title }}</p>@endif
            <p style="margin: 0;">{{ $company->name }}</p>
        </div>
    </div>
    @endif

    <div class="footer">
        <table style="width: 100%;">
            <tr>
                <td>INVOICE<br>No. {{ $invoice->invoice_number }}</td>
                <td style="text-align: right;">1</td>
            </tr>
        </table>
    </div>
</body>
</html>
