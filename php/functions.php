<?php
  function get_accounts($db){
    $sql = "SELECT * FROM `accounts`";
    $result = mysqli_query($db, $sql);
    $accounts = mysqli_fetch_all($result, MYSQLI_ASSOC);
    return $accounts;
  }

  function get_cats($db){
    $sql = "SELECT * FROM `cats`";
    $result = mysqli_query($db, $sql);
    $cats = mysqli_fetch_all($result, MYSQLI_ASSOC);
    return $cats;
  }

  function get_history($db){
    $sql = "SELECT h.*, c.img, a.name FROM history h INNER JOIN cats c ON h.cat_id = c.id INNER JOIN accounts a ON h.account_id = a.id ORDER BY h.date DESC";
    $result = mysqli_query($db, $sql);
    $history = mysqli_fetch_all($result, MYSQLI_ASSOC);
    return $history;
  }

?>
