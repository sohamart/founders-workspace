Add-Type -AssemblyName System.Drawing

function Generate-AppIcon {
    param(
        [int]$size,
        [string]$outputPath,
        [bool]$maskable = $false
    )

    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Background color: Deep Slate #0b0f19
    $bgColor = [System.Drawing.Color]::FromArgb(255, 11, 15, 25)
    $bgBrush = New-Object System.Drawing.SolidBrush($bgColor)
    $graphics.FillRectangle($bgBrush, 0, 0, $size, $size)

    # Rounded Squircle or Full Fill
    $margin = if ($maskable) { 0 } else { [int]($size * 0.04) }
    $rectSize = $size - ($margin * 2)

    # Ambient radial gradient simulation
    $glowColor = [System.Drawing.Color]::FromArgb(80, 249, 115, 22)
    $glowBrush = New-Object System.Drawing.SolidBrush($glowColor)
    $glowRad = [int]($size * 0.7)
    $glowOffset = [int](($size - $glowRad) / 2)
    $graphics.FillEllipse($glowBrush, $glowOffset, $glowOffset - [int]($size * 0.05), $glowRad, $glowRad)

    # Glowing outer border ring
    $penColor = [System.Drawing.Color]::FromArgb(255, 234, 88, 12)
    $pen = New-Object System.Drawing.Pen($penColor, [int]($size * 0.025))
    $ringMargin = [int]($size * 0.07)
    $ringSize = $size - ($ringMargin * 2)
    $graphics.DrawEllipse($pen, $ringMargin, $ringMargin, $ringSize, $ringSize)

    # Inner Gold Ring
    $innerPenColor = [System.Drawing.Color]::FromArgb(200, 251, 191, 36)
    $innerPen = New-Object System.Drawing.Pen($innerPenColor, [int]($size * 0.012))
    $innerMargin = [int]($size * 0.1)
    $innerSize = $size - ($innerMargin * 2)
    $graphics.DrawEllipse($innerPen, $innerMargin, $innerMargin, $innerSize, $innerSize)

    # Top Badge: "SSA TEAM"
    $fontFamily = [System.Drawing.FontFamily]::GenericSansSerif
    $topFontSize = [float]($size * 0.042)
    $topFont = New-Object System.Drawing.Font($fontFamily, $topFontSize, [System.Drawing.FontStyle]::Bold)
    $goldBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 254, 240, 138))
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $graphics.DrawString("★ SSA TEAM ★", $topFont, $goldBrush, ($size / 2), ($size * 0.15), $format)

    # Central Heraldic Monogram: "FW"
    $mainFontSize = [float]($size * 0.28)
    $mainFont = New-Object System.Drawing.Font($fontFamily, $mainFontSize, [System.Drawing.FontStyle]::Bold)
    $mainBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 249, 115, 22))
    $graphics.DrawString("FW", $mainFont, $mainBrush, ($size / 2), ($size * 0.32), $format)

    # White metallic overlay text for 3D metallic feel
    $overlayFont = New-Object System.Drawing.Font($fontFamily, [float]($size * 0.275), [System.Drawing.FontStyle]::Bold)
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 255, 251, 235))
    $graphics.DrawString("FW", $overlayFont, $whiteBrush, ($size / 2) - 1, ($size * 0.32) - 1, $format)

    # Bottom Banner: "FOUNDERS PORTAL"
    $bannerFontSize = [float]($size * 0.045)
    $bannerFont = New-Object System.Drawing.Font($fontFamily, $bannerFontSize, [System.Drawing.FontStyle]::Bold)
    $whiteTextBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $graphics.DrawString("FOUNDERS PORTAL", $bannerFont, $whiteTextBrush, ($size / 2), ($size * 0.75), $format)

    # 3 Gold Accent Stars
    $starFont = New-Object System.Drawing.Font($fontFamily, [float]($size * 0.035), [System.Drawing.FontStyle]::Bold)
    $graphics.DrawString("★   ★   ★", $starFont, $goldBrush, ($size / 2), ($size * 0.83), $format)

    # Save PNG
    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

    # Clean up
    $graphics.Dispose()
    $bitmap.Dispose()
    Write-Output "Generated: $outputPath ($size x $size)"
}

$publicDir = Resolve-Path "d:\Founders Workspace\frontend\public"

Generate-AppIcon -size 192 -outputPath "$publicDir\pwa-192x192.png" -maskable $false
Generate-AppIcon -size 512 -outputPath "$publicDir\pwa-512x512.png" -maskable $false
Generate-AppIcon -size 180 -outputPath "$publicDir\apple-touch-icon.png" -maskable $false
Generate-AppIcon -size 512 -outputPath "$publicDir\pwa-maskable-512x512.png" -maskable $true

Write-Output "All PWA Icons generated successfully!"
