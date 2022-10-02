<?php
    include_once '../class/url.php';
    include_once '../class/user.php';

    class Highlight{

        // Connection
        private $conn;

        // Table    
        private $db_table = "highlights";

        // Columns
        public $id;
        public $urlid;
        public $date;
        public $email;
        public $userid;      
        public $url;

        public $startNode;
        public $startOffset;  
        public $startIsText;
        public $startTagName;
        public $startHTML;

        public $endNode;
        public $endOffset;
        public $endIsText;
        public $endTagName;
        public $endHTML;
   
       
        // Db connection
        public function __construct($db){
            $this->conn = $db;
        }

        // GET ALL
        public function getHighlights() {
            $u = new URL($this->conn);
            $urlid = $u->getUrlId(($this->url));
            $sqlQuery = "SELECT startNode,
                                startOffset,
                                startIsText,
                                startTagName,
                                startHTML,
                                endNode,
                                endOffset,
                                endIsText,
                                endTagName,
                                endHTML
                         FROM
                           " . $this->db_table . "
                         WHERE 
                                urlid = :urlid";
            $stmt = $this->conn->prepare($sqlQuery);
            $stmt->bindParam(":urlid", $urlid);
            
            $stmt->execute();
            return $stmt;
        }

        // CREATE
        public function createHighlight(){

            // get userid and urlid
            $url = new URL($this->conn);
            $this->urlid = $url ->getUrlId(($this->url));
            if ($this->urlid == "") {
                echo("URL does not exist");
                $this->urlid = $url->createURL($this->url);
            }
            $user = new User($this->conn);
            $this->userid = $user->getUserId($this->email);
          
            // check if highlight already exists
            $sqlCheckQuery = "SELECT *
          FROM
            ". $this->db_table ."
            WHERE 
                userid = :userid AND
                urlid = :urlid AND
                date = :date AND
                startNode = :startNode AND
                startOffset = :startOffset AND
                startIsText = :startIsText AND
                startTagName = :startTagName AND
                startHTML = :startHTML AND
                endNode = :endNode AND
                endOffset = :endOffset AND
                endIsText = :endIsText AND
                endTagName = :endTagName AND
                endHTML = :endHTML 
                
              LIMIT 1";
            $stmt = $this->conn->prepare($sqlCheckQuery);
            $stmt->bindParam(":userid", $this->userid);
            $stmt->bindParam(":urlid", $this->urlid);
            $stmt->bindParam(":date", $this->date);
            
            $stmt->bindParam(":startNode", $this->startNode);
            $stmt->bindParam(":startOffset", $this->startOffset);
            $stmt->bindParam(":startIsText", $this->startIsText);
            $stmt->bindParam(":startTagName", $this->startTagName);
            $stmt->bindParam(":startHTML", $this->startHTML);
           
            $stmt->bindParam(":endNode", $this->endNode);
            $stmt->bindParam(":endOffset", $this->endOffset);
            $stmt->bindParam(":endIsText", $this->endIsText);
            $stmt->bindParam(":endTagName", $this->endTagName);
            $stmt->bindParam(":endHTML", $this->endHTML);
          
            echo("\r\n!" . $this->userid . "!\r\n");
            echo("\r\n!" . $this->urlid . "!\r\n");
            echo("\r\n!" . $this->date . "!\r\n");
            
            $stmt->execute();
            echo($stmt->rowCount());
            
            if ($stmt->rowCount() == 0)
            {            

                $sqlQuery = "INSERT INTO
                            ". $this->db_table ."
                        SET
                            userid = :userid,
                            date = :date, 
                            urlid = :urlid, 
                            
                            startNode = :startNode,
                            startOffset = :startOffset,
                            startIsText = :startIsText,
                            startTagName = :startTagName,
                            startHTML = :startHTML,
                            endNode = :endNode,
                            endOffset = :endOffset, 
                            endIsText = :endIsText, 
                            endTagName = :endTagName, 
                            endHTML = :endHTML";
            
                $stmt = $this->conn->prepare($sqlQuery);
                $stmt->bindParam(":userid", $this->userid);
                $stmt->bindParam(":urlid", $this->urlid);
                $stmt->bindParam(":date", $this->date);
                
                $stmt->bindParam(":startNode", $this->startNode);
                $stmt->bindParam(":startOffset", $this->startOffset);
                $stmt->bindParam(":startIsText", $this->startIsText);
                $stmt->bindParam(":startTagName", $this->startTagName);
                $stmt->bindParam(":startHTML", $this->startHTML);
               
                $stmt->bindParam(":endNode", $this->endNode);
                $stmt->bindParam(":endOffset", $this->endOffset);
                $stmt->bindParam(":endIsText", $this->endIsText);
                $stmt->bindParam(":endTagName", $this->endTagName);
                $stmt->bindParam(":endHTML", $this->endHTML);
                   
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
        public function getOrder(){
            $sqlQuery = "SELECT
                        id, 
                        user,
                        date, 
                        company, 
                        item, 
                        size, 
                        price
                      FROM
                        ". $this->db_table ."
                    WHERE 
                       id = ?
                    LIMIT 0,1";
            $stmt = $this->conn->prepare($sqlQuery);

            $stmt->bindParam(1, $this->id);

            $stmt->execute();

            $dataRow = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $this->user = $dataRow['user'];
            $this->name = $dataRow['date'];
            $this->email = $dataRow['company'];
            $this->age = $dataRow['item'];
            $this->designation = $dataRow['size'];
            $this->created = $dataRow['price'];
        }        

        // UPDATE
        public function updateOrder(){
            $sqlQuery = "UPDATE
                        ". $this->db_table ."
                    SET
                        user = :user,
                        name = :date, 
                        email = :company, 
                        age = :item, 
                        designation = :size, 
                        created = :price
                    WHERE 
                        id = :id";
        
            $stmt = $this->conn->prepare($sqlQuery);
        
            $this->user=htmlspecialchars(strip_tags($this->user));
            $this->name=htmlspecialchars(strip_tags($this->date));
            $this->email=htmlspecialchars(strip_tags($this->company));
            $this->age=htmlspecialchars(strip_tags($this->item));
            $this->designation=htmlspecialchars(strip_tags($this->size));
            $this->created=htmlspecialchars(strip_tags($this->price));
            $this->id=htmlspecialchars(strip_tags($this->id));
        
            // bind data
            $stmt->bindParam(":user", $this->cousermpany);
            $stmt->bindParam(":date", $this->date);
            $stmt->bindParam(":company", $this->company);
            $stmt->bindParam(":item", $this->item);
            $stmt->bindParam(":size", $this->size);
            $stmt->bindParam(":price", $this->price);
            $stmt->bindParam(":id", $this->id);
        
            if($stmt->execute()){
               return true;
            }
            return false;
        }

        // DELETE
        function deleteEmployee(){
            $sqlQuery = "DELETE FROM " . $this->db_table . " WHERE id = ?";
            $stmt = $this->conn->prepare($sqlQuery);
        
            $this->id=htmlspecialchars(strip_tags($this->id));
        
            $stmt->bindParam(1, $this->id);
        
            if($stmt->execute()){
                return true;
            }
            return false;
        }

    }
?>