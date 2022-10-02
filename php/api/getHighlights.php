<?php
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: access");
    header("Access-Control-Allow-Methods: GET");
    header("Access-Control-Allow-Credentials: true");
    header('Content-Type: application/json');
    include_once '../config/database.php';
    include_once '../class/highlight.php';

    $database = new Database();
    $db = $database->getConnection();
    $item = new Highlight($db);

    $data = json_decode(file_get_contents("php://input"));

    $item->url = $_GET['url'];

    $stmt = $item->getHighlights();
    $itemCount = $stmt->rowCount();

    if($itemCount > 0){
        
        $arr = array();
        $arr["highlights"] = array();
      
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
            extract($row);
            $e = array(
                "startNode" => $startNode,
                "startOffset"=> $startOffset,
                "startIsText" => $startIsText,
                "startTagName" => $startTagName,
                "startHTML" => $startHTML,
                "endNode" => $endNode,
                "endOffset" => $endOffset,
                "endIsText" => $endIsText,
                "endTagName" => $endTagName,
                "endHTML" => $endHTML
            );

            array_push($arr["highlights"], $e);
        }
        echo json_encode($arr);
    }

    else {
        http_response_code(404);
        echo json_encode(
            array("message" => "No highlights found."));
    }
    
?>