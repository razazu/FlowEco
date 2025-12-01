<?php
add_action('init', function() {
    $request = $_SERVER['REQUEST_URI'];
    
    // Remove query string if exists
    $request = strtok($request, '?');
    
    if ($request === '/manifest.json' || $request === 'manifest.json') {
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: public, max-age=86400');
        
        $manifest = [
            'name' => 'FlowEco - ניהול פיננסי חכם',
            'short_name' => 'FlowEco',
            'description' => 'נהל את הכספים שלך בחכמה עם יועץ AI',
            'start_url' => '/dashboard',
            'display' => 'standalone',
            'background_color' => '#0a0e1a',
            'theme_color' => '#10B981',
            'orientation' => 'portrait',
            'lang' => 'he',
            'dir' => 'rtl',
            'icons' => [
                [
                    'src' => '/wp-content/uploads/2025/11/floweco-icon-192.png',
                    'sizes' => '192x192',
                    'type' => 'image/png',
                    'purpose' => 'any maskable'
                ],
                [
                    'src' => '/wp-content/uploads/2025/11/floweco-icon-512.png',
                    'sizes' => '512x512',
                    'type' => 'image/png',
                    'purpose' => 'any maskable'
                ]
            ]
        ];
        
        echo json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
}, 1);