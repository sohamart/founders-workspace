Add-Type -AssemblyName System.Drawing

$srcPath = 'C:\Users\Soham\.gemini\antigravity-ide\brain\89e19308-603e-4a85-a3b7-0b4145f0e64a\founders_app_logo_1790232554855.jpg'
$publicDir = 'd:\Founders Workspace\frontend\public'

Copy-Item $srcPath -Destination "$publicDir\app-logo.png" -Force

function Resize-Image {
    param([string]$inPath, [string]$outPath, [int]$width, [int]$height)
    $srcImg = [System.Drawing.Image]::FromFile($inPath)
    $destBmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($destBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($srcImg, 0, 0, $width, $height)
    $destBmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $destBmp.Dispose()
    $srcImg.Dispose()
    Write-Output "Created: $outPath ($width by $height)"
}

Resize-Image -inPath $srcPath -outPath "$publicDir\pwa-512x512.png" -width 512 -height 512
Resize-Image -inPath $srcPath -outPath "$publicDir\pwa-maskable-512x512.png" -width 512 -height 512
Resize-Image -inPath $srcPath -outPath "$publicDir\pwa-192x192.png" -width 192 -height 192
Resize-Image -inPath $srcPath -outPath "$publicDir\apple-touch-icon.png" -width 180 -height 180
Resize-Image -inPath $srcPath -outPath "$publicDir\favicon.png" -width 64 -height 64

Write-Output 'All Gemini App Icons successfully generated and saved!'
