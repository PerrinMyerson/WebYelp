<?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

    include_once '../config/database.php';
    include_once '../class/highlight.php';

    $database = new Database();
    $db = $database->getConnection();
    $item = new Highlight($db);

    $data = json_decode(file_get_contents("php://input"));

    $item->email = $data->email;
    $item->url = $data->url;
    $item->date = $data->date;

    $item->startNode= $data->startNode;
    $item->startOffset= $data->startOffset;
    $item->startIsText= $data->startIsText;
    $item->startTagName= $data->startTagName;
    $item->startHTML= $data->startHTML;
    $item->endNode= $data->endNode;
    $item->endOffset= $data->endOffset;
    $item->endIsText= $data->endIsText;
    $item->endTagName= $data->endTagName;
    $item->endHTML= $data->endHTML;
   
    echo("\r\n!" . $data->email . "!\r\n");
    echo("\r\n!" . $data->url . "!\r\n");
    echo("\r\n!" . $data->date . "!\r\n");
   
    if($item->createHighlight())
    {
        echo 'Highlight created successfully.';
    } else {
        echo 'Highlight could not be created.';
    }
?>