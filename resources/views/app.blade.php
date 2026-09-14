<!DOCTYPE html>
<html lang="id">
    <head>
        @php
            $hotFile = public_path('hot');
            $viteDevServerReady = false;

            if (is_file($hotFile)) {
                $hotUrl = parse_url(trim(file_get_contents($hotFile)));
                $hotHost = $hotUrl['host'] ?? null;
                $hotPort = $hotUrl['port'] ?? 80;

                if ($hotHost) {
                    $connection = @fsockopen($hotHost, $hotPort, $errorCode, $errorMessage, 0.2);
                    $viteDevServerReady = is_resource($connection);

                    if ($viteDevServerReady) {
                        fclose($connection);
                    }
                }
            }

            if (! $viteDevServerReady) {
                \Illuminate\Support\Facades\Vite::useHotFile(storage_path('framework/vite-hot-unavailable'));
            }

            $viteAssetsReady = $viteDevServerReady || file_exists(public_path('build/manifest.json'));
        @endphp
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title>Sistem Invoicing &amp; Billing | DEVSPACE</title>
        <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
        <style>
            body { margin: 0; background: #f7f8fa; color: #172033; font-family: Inter, system-ui, sans-serif; }
        </style>
        @if ($viteAssetsReady)
            @vite(['resources/css/app.css', 'resources/js/app.js'])
        @else
            <script>
                window.setTimeout(() => window.location.reload(), 1000);
            </script>
        @endif
    </head>
    <body>
        <div id="app"></div>
    </body>
</html>
