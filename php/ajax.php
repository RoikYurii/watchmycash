<?php
  require_once 'config.php';

  function add_history($account_id, $sum, $cat_id, $action, $comment, $db){
    $query ="INSERT INTO history (account_id, sum, cat_id, action, comment ) VALUES ('$account_id', '$sum', '$cat_id', '$action', '$comment')";
    $insert = mysqli_query($db, $query);
    $last_id = mysqli_insert_id($db);
    if ($insert) {
      return $last_id;
    } else {
      return false;
    }
  }

  function clear_history($db){
    $query ="DELETE FROM history";
    $result = mysqli_query($db, $query);
    if($result){
      $data = array(
        "code" => "200"
      );
    } else {
      $data = array(
        "code" => "500"
      );
    }
    echo json_encode($data);
  }
  if($_POST['function'] ==  'clear_history') {
    clear_history($db);
  }

  function change_balance($id, $sum, $action, $cat, $comment, $db){
    $sql = "SELECT balance FROM accounts WHERE id='$id'";
    $result = mysqli_query($db, $sql);
    $row = mysqli_fetch_array($result, MYSQLI_ASSOC);
    $cur_ballance = ($row['balance']);
    if ($action == 'increase') {
      $new_balance = $cur_ballance + $sum;
    } else {
      $new_balance = $cur_ballance - $sum;
    }
    $query ="UPDATE accounts SET balance='$new_balance' WHERE id='$id'";
    $result = mysqli_query($db, $query);
    $receipt_id = add_history($id, $sum, $cat, $action, $comment, $db);
    $receipt_sql = "SELECT h.*, c.img, a.name FROM history h INNER JOIN cats c ON h.cat_id = c.id INNER JOIN accounts a ON h.account_id = a.id WHERE h.id = $receipt_id";
    $receipt_result = mysqli_query($db, $receipt_sql);
    $receipt = mysqli_fetch_array($receipt_result, MYSQLI_ASSOC);
    if($receipt_result){
      $data = array(
        "code" => "200",
        "new_balance" => $new_balance,
        "sum" => $receipt['sum'],
        "action" => $receipt['action'],
        "comment" => $receipt['comment'],
        "date" => $receipt['date'],
        "account_name" => $receipt['name'],
        "cat_img" => $receipt['img'],
      );
    } else {
      $data = array(
        "code" => "500",
      );
    }
    echo json_encode($data);
  }
  if($_POST['function'] == 'change_balance') {
    change_balance($_POST['id'], $_POST['sum'], $_POST['action'], $_POST['cat'], $_POST['comment'], $db);
  }

  function edit_account($id, $name, $value, $db){
    $query ="UPDATE accounts SET $name='$value' WHERE id='$id'";
    $result = mysqli_query($db, $query);
    if($result){
      $data = array(
        "code" => "200",
        "value" => $value
      );
    } else {
      $data = array(
        "code" => "500",
      );
    }
    echo json_encode($data);
  }
  if($_POST['function'] == 'edit_account') {
    edit_account($_POST['id'], $_POST['name'], $_POST['value'], $db);
  }

  function add_account($db){
    $query ="INSERT INTO accounts (name) VALUES ('Новий рахунок')";
    $insert = mysqli_query($db, $query);
    $last_id = mysqli_insert_id($db);
    $query = "SELECT * FROM accounts WHERE id='$last_id'";
    $result = mysqli_query($db, $query);
    if($result){
      $row = mysqli_fetch_array($result, MYSQLI_ASSOC);
      $data = array(
        "code" => "200",
        "id" => $row['id'],
        "name" => $row['name'],
        "balance" => $row['balance']
      );
    } else {
      $data = array(
        "code" => "500",
      );
    }
    echo json_encode($data);
  }
  if($_POST['function'] == 'add_account') {
    add_account($db);
  }

  function delete_account($id, $db){
    $sql = "DELETE FROM history WHERE account_id=$id";
    $del_result = mysqli_query($db, $sql);
    $query = "DELETE FROM accounts WHERE id=$id";
    $result = mysqli_query($db, $query);
    if($result){
      $data = array(
        "code" => "200",
        "id" => $id,
      );
    } else {
      $data = array(
        "code" => "500",
      );
    }
    echo json_encode($data);
  }
  if($_POST['function'] == 'delete_account') {
    delete_account($_POST['id'], $db);
  }

?>
