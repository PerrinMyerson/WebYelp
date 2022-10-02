<?php
    class User{

        // Connection
        private $conn;

        // Table
        private $db_table = "users";

        // Columns
        public $id;
        public $email;
      
        // Db connection
        public function __construct($db){
            $this->conn = $db;
        }

        // GET ALL
        public function getUsers(){
            $sqlQuery = "SELECT id, name, email FROM " . $this->db_table . "";
            $stmt = $this->conn->prepare($sqlQuery);
            $stmt->execute();
            return $stmt;
        }

        // CREATE
        public function createUser(){
            $sqlCheckQuery = "SELECT *
          FROM
            ". $this->db_table ."
            WHERE 
                 email = :email 
            LIMIT 1";
          
            $stmt = $this->conn->prepare($sqlCheckQuery);
            $stmt->bindParam(":email", $this->email);
            $stmt->execute();
            echo($stmt->rowCount());
            
            if ($stmt->rowCount() == 0)
            {            
                $sqlQuery = "INSERT INTO
                            ". $this->db_table ."
                        SET
                            email = :email";
                            
                  
                $stmt = $this->conn->prepare($sqlQuery);
                
                // sanitize
                $this->email=htmlspecialchars(strip_tags($this->email));
            
                // bind data
                $stmt->bindParam(":email", $this->email);
                 if($stmt->execute()){
                return true;
                }
                return false;
            }
            else
            {
                echo("Row already exists");
                return false;
            }
        }

        // READ single
        public function getUserId($email){
            $sqlQuery = "SELECT id FROM " . $this->db_table ."
                    WHERE email = ? LIMIT 0,1";

            $stmt = $this->conn->prepare($sqlQuery);

            $stmt->bindParam(1, $email);

            $stmt->execute();
            
            $dataRow = $stmt->fetch(PDO::FETCH_ASSOC);
            return $dataRow['id'];
        }        

    }

?>