<div class="receipt">
  <div class="receipt__cat receipt__cat--<?php echo $item['action']; ?>">
    <img src="<?php echo $item['img']; ?>" alt="">
  </div>
  <div class="receipt__item receipt__item--cat"></div>
  <div class="receipt__item receipt__item--info">
    <div class="receipt__account"><?php echo $item['name']; ?></div>
    <div class="receipt__date"><?php echo $item['date']; ?></div>
  </div>
  <div class="receipt__item receipt__item--comment">
    <input class="receipt__comment" disabled type="text" value="<?php echo $item['comment']; ?>">
  </div>
  <div class="receipt__item receipt__item--sum">
      <div class="receipt__sum receipt__sum--<?php echo $item['action']; ?>">
      <?php if ($item['action'] == "increase") { ?>
        <span>+&#8372;</span><?php echo $item['sum']; ?>
      <?php } else {?>
        <span>-&#8372;</span><?php echo $item['sum']; ?>
      <?php } ?>
      </div>
  </div>
</div>
