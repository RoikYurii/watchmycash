<?php
   include("php/config.php");
   session_start();

   $error = "";
   if($_SERVER["REQUEST_METHOD"] == "POST") {
      // username and password sent from form

      $myusername = mysqli_real_escape_string($db,$_POST['username']);
      $mypassword = mysqli_real_escape_string($db,$_POST['password']);

      $sql = "SELECT id FROM admin WHERE username = '$myusername' and passcode = '$mypassword'";
      $result = mysqli_query($db,$sql);
      $row = mysqli_fetch_array($result,MYSQLI_ASSOC);
      // $active = $row['active'];

      $count = mysqli_num_rows($result);

      // If result matched $myusername and $mypassword, table row must be 1 row

      if($count == 1) {
         $_SESSION['login_user'] = $myusername;
         header("location: index.php");
      }else {
         $error = "Невірні дані для входу";
      }
   }
?>
<html>

   <head>
      <title>Вхід</title>
      <link href="https://fonts.googleapis.com/css?family=Exo+2:400,500,600,700" rel="stylesheet">
      <link rel="stylesheet" href="css/normilize.css">
      <link rel="stylesheet" href="css/style.css">
   </head>

   <body>
     <div class="pass">
       <form class="pass__form" action = "" method = "post">
          <h3 class="pass__title">Логін :</h3 class="pass__title">
          <input class="pass__input" type = "text" name = "username"/>
          <h3 class="pass__title">Пароль :</h3 class="pass__title">
          <input class="pass__input" type = "password" name = "password" />
          <p class="pass__error"><?php echo $error; ?></p>
          <button class="pass__btn" type="submit" name="button">Увійти</button>
       </form>
     </div>
   </body>
</html>
