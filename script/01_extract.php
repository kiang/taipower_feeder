<?php
$fh = fopen(__DIR__ . '/ziplist.csv', 'r');
$header = fgetcsv($fh, 2048);
$tmpZipFile = __DIR__ . '/tmp.zip';
$srcPath = dirname(__DIR__) . '/src';
$zip = new ZipArchive;
while($line = fgetcsv($fh, 2048)) {
    file_put_contents($tmpZipFile, file_get_contents($line[4]));
    if ($zip->open($tmpZipFile) === TRUE) {
        $filesToExtract = array();
        for( $i = 0; $i < $zip->numFiles; $i++ ) {
            $stat = $zip->statIndex( $i );
            if(false === strpos($stat['name'], 'schema') && (false !== strpos($stat['name'], 'feeder') || false !== strpos($stat['name'], 'capacity'))) {
                $filesToExtract[] = basename($stat['name']);
            }
        }
        if(!empty($filesToExtract)) {
            $zip->extractTo($srcPath, $filesToExtract);
        }
        $zip->close();
    }
    unlink($tmpZipFile);
}