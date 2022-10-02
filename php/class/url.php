<?php
    class URL{

        // Connection
        private $conn;

        // Table
        private $db_table = "urls";

        // Columns
        public $id;
        public $url;
       
        // Db connection
        public function __construct($db){
            $this->conn = $db;
        }

        // GET ALL
        public function getUrlId($url){
            $sqlQuery = "SELECT id 
            FROM 
            ". $this->db_table ."
            WHERE
                url= :url
                Limit 1";
            $stmt = $this->conn->prepare($sqlQuery);
            $stmt->bindParam(":url", $url);
            $stmt->execute();
            $dataRow = $stmt->fetch(PDO::FETCH_ASSOC);
            return $dataRow['id'];
        }

        // CREATE
        public function createURL($url){
            $sqlCheckQuery = "SELECT *
            FROM
            ". $this->db_table ."
            WHERE 
                url = :url 
                LIMIT 1";

            $stmt = $this->conn->prepare($sqlCheckQuery);
            $stmt->bindParam(":url", $url);
            $stmt->execute();
            if ($stmt->rowCount() == 0)
            {            
                echo("URL does not exist");
                $sqlQuery = "INSERT INTO
                            ". $this->db_table ."
                        SET
                            url = :url";
               
            
                $stmt = $this->conn->prepare($sqlQuery);
                
                $stmt->bindParam(":url", $url);
                if($stmt->execute()) {
                    return $this->conn->lastInsertId();             
                }
                else {  
                    return false;
                }
            } else {
                echo("Row already exists");
                return false;
            }
        }
    }
?>