<?php

// Dedicated QA router. The fixed business date is confined to the test harness.
$publicPath = realpath(__DIR__.'/../../public');
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '');
if ($uri !== '/' && is_file($publicPath.$uri)) return false;
define('LARAVEL_START', microtime(true));
require __DIR__.'/../../vendor/autoload.php';
\Carbon\Carbon::setTestNow(\Carbon\Carbon::parse('2026-11-17T05:00:00Z'));
$app = require __DIR__.'/../../bootstrap/app.php';
$request = \Illuminate\Http\Request::capture();
$kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle($request);
// Symfony calculates Max-Age using PHP wall time, not Carbon's QA clock.
// Keep normal cookie lifetimes on the wire while business-date tests stay fixed.
foreach ($response->headers->getCookies() as $cookie) {
    if (in_array($cookie->getName(), ['XSRF-TOKEN', config('session.cookie')], true) && $cookie->getValue() && $cookie->getExpiresTime()) {
        $response->headers->setCookie($cookie->withExpires(time() + config('session.lifetime') * 60));
    }
}
$response->send();
$kernel->terminate($request, $response);
