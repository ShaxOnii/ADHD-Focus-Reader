Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('C:\Users\karlo\.gemini\antigravity\scratch\adhd-reader-extension\icon_v2.png')

$bitmap128 = new-object System.Drawing.Bitmap(128,128)
$graph = [System.Drawing.Graphics]::FromImage($bitmap128)
$graph.DrawImage($img, 0, 0, 128, 128)
$bitmap128.Save('C:\Users\karlo\.gemini\antigravity\scratch\adhd-reader-extension\icon_128.png', [System.Drawing.Imaging.ImageFormat]::Png)
$graph.Dispose()
$bitmap128.Dispose()

$bitmap48 = new-object System.Drawing.Bitmap(48,48)
$graph48 = [System.Drawing.Graphics]::FromImage($bitmap48)
$graph48.DrawImage($img, 0, 0, 48, 48)
$bitmap48.Save('C:\Users\karlo\.gemini\antigravity\scratch\adhd-reader-extension\icon_48.png', [System.Drawing.Imaging.ImageFormat]::Png)
$graph48.Dispose()
$bitmap48.Dispose()

$bitmap16 = new-object System.Drawing.Bitmap(16,16)
$graph16 = [System.Drawing.Graphics]::FromImage($bitmap16)
$graph16.DrawImage($img, 0, 0, 16, 16)
$bitmap16.Save('C:\Users\karlo\.gemini\antigravity\scratch\adhd-reader-extension\icon_16.png', [System.Drawing.Imaging.ImageFormat]::Png)
$graph16.Dispose()
$bitmap16.Dispose()

$img.Dispose()
