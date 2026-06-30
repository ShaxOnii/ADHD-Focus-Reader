Add-Type -AssemblyName System.Drawing
$imgPath = 'C:\Users\karlo\.gemini\antigravity\scratch\adhd-reader-extension\icon_v2.png'
$img = [System.Drawing.Image]::FromFile($imgPath)

$zoomFactor = 1.6
$cropWidth = [int]($img.Width / $zoomFactor)
$cropHeight = [int]($img.Height / $zoomFactor)
$cropX = [int](($img.Width - $cropWidth) / 2)
$cropY = [int](($img.Height - $cropHeight) / 2)

$srcRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropWidth, $cropHeight)

function Save-Resized($size, $filename) {
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graph = [System.Drawing.Graphics]::FromImage($bitmap)
    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $graph.DrawImage($img, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $bitmap.Save("C:\Users\karlo\.gemini\antigravity\scratch\adhd-reader-extension\$filename", [System.Drawing.Imaging.ImageFormat]::Png)
    $graph.Dispose()
    $bitmap.Dispose()
}

Save-Resized 128 'icon_128.png'
Save-Resized 48 'icon_48.png'
Save-Resized 16 'icon_16.png'

$img.Dispose()
