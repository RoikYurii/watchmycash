;(function() {

  // Hide preloader
  window.onload = function () {
    $('.preloader').fadeOut();
  };

  // Section changing nav
  function navigate(duration) {
    let sectionName = document.location.hash.slice(1);
    if (sectionName.length < 1) {
      return false;
    }
    $('.nav__item').removeClass('nav__item--active');
    let curNav = $('.nav__item[href="#'+sectionName+'"]')
    curNav.addClass('nav__item--active');

    let newSection = $('.'+sectionName+'');
    let activeSection = $('.section--active');
    if (activeSection.hasClass(sectionName)) {
      return false;
    }
    let w = activeSection.width();
    activeSection.animate({
      left: w+200
    }, duration, function() {
      activeSection.removeClass('section--active');
      activeSection.css('left', '0');
      newSection.addClass('section--active');
    });
  }

  // Navigation
  navigate(0);
  $('.nav__item').click(function () {
    document.location.hash = $(this).attr('href');
    navigate(700);
  })

  // Account
  // Get cats
  let item = $('.account__item--cats').first();
  let catItems = item.find('.account__cat');
  let catsHtml = "";
  for (var i = 0; i < catItems.length; i++) {
    catsHtml+='<div class="account__cat" data-id="'+$(catItems[i]).attr('data-id')+'"><img class="account__cat-img" src="'+$(catItems[i]).find('.account__cat-img').attr('src')+'" alt=""><div class="account__cat-desc">'+$(catItems[i]).find('.account__cat-desc').html()+'</div></div>';
  }

  // Validation
  function setFocus(el) {
    el.addClass('focus');
  }
  function delFocus(el) {
    el.removeClass('focus');
  }
  function showError(text) {
    let error = $('.num-error');
    let errorText = $('.num-error__text');
    errorText.html(text);
    error.fadeIn();
  }
  function inputValidate(val, type=false) {
    if (val.length < 1) {
      showError("Потрібно ввести коректне значення");
      return false;
    }
    if (type && (type === "number" || type === "balance")) {
      if (!val.match(/^\d+$/)) {
        showError("Потрібно ввести число");
        return false;
      }
    }
    return true;
  }

  // Wallet operations
  // Choose cat
  $(document).on('click', '.account__cat', function () {
    let cats = $(this).siblings('.account__cat');
    cats.removeClass('account__cat--active');
    $(this).addClass('account__cat--active');
  });
  // Increase/decrease count
  $(document).on('click', '.account__btn', function () {
    let id = $(this).attr("data-id");
    let sumHtml = $(".account__sum[data-id='"+id+"']");
    let balanceHtml = $(".account__balance[data-id='"+id+"']");
    let commentHtml = $(".account__comment[data-id='"+id+"']");
    let sum = sumHtml.val();
    let res = inputValidate(sum, "number");
    if (res) {
      delFocus(sumHtml.parent());
      let catItem = $(this).parent().siblings('.account__item--cats');
      let catHtml = catItem.find('.account__cat--active');
      let cat = catHtml.attr('data-id');
      if (!cat) {
        if ($(this).attr("data-action") === "increase") {
          cat = 6;
        } else {
          showError("Виберіть категорію");
          setFocus(catItem);
          return false;
        }
      } else {
        delFocus(catItem);
      }
      let action = $(this).attr("data-action");
      let comment = commentHtml.val();
      if (!comment) {
        comment = "";
      }
      $.ajax({
       type: "POST",
       url: 'php/ajax.php',
       data:{'function': 'change_balance', 'sum': sum, 'action': action, 'id': id, 'comment': comment, 'cat':cat},
       success:function(jsonData) {
         // console.log(jsonData);
         let data = JSON.parse(jsonData);
         if (data.code === "200") {
           balanceHtml.val(data.new_balance);
           sumHtml.val('');
           commentHtml.val('');
           catHtml.removeClass('account__cat--active');
           let history = $('.history__inner');
           let account_name = data.account_name;
           let cat_img = data.cat_img;
           let sum = data.sum;
           let comment = data.comment;
           let action = data.action;
           let date = data.date;
           let symbol;
           if (action === "increase") {
             symbol = "+";
           } else {
             symbol = "-";
           }
           let receipt = `
             <div class="receipt">
               <div class="receipt__cat receipt__cat--${action}">
                 <img src="${cat_img}" alt="">
               </div>
               <div class="receipt__item receipt__item--cat"></div>
               <div class="receipt__item receipt__item--info">
                 <div class="receipt__account">${account_name}</div>
                 <div class="receipt__date">${date}</div>
               </div>
               <div class="receipt__item receipt__item--comment">
                 <input class="receipt__comment" disabled type="text" value="${comment}">
               </div>
               <div class="receipt__item receipt__item--sum">
                 <div class="receipt__sum receipt__sum--${action}">
                   <span>${symbol}&#8372;</span>${sum}
                 </div>
               </div>
             </div>
            `
            history.prepend(receipt);
            if (!$('#clearHistory').hasClass('active')) {
              $('#clearHistory').addClass('active');
            }
            
         } else if (data.code === "500") {
           $('.num-error__text').html('Виникла помилка.<br> Оновіть сторінку та зверніться до адміністратора.');
           $('.num-error').fadeIn();
         }
       }
      });
    } else {
      setFocus(sumHtml.parent());
      return false;
    }
  });

  // Accounts editing
  // Close account editing
  function closeChoise(el) {
    el.parent().find('.account__choise').addClass('hidden');
    el.parent().siblings('input').prop("disabled", true);
    el.siblings('.account__edit').removeClass('hidden');
    el.parent().parent().removeClass('focus');
  }
  // Save account editing
  function editAccount(el) {
    let valueHtml = el.parent().siblings('input');
    let newValue = valueHtml.val();
    let curValue = valueHtml.attr('data-val');
    let name = el.parent().siblings('input').attr('name');
    let id = el.attr('data-id');
    $.ajax({
     type: "POST",
     url: 'php/ajax.php',
     data:{'function': 'edit_account', 'id': id, 'name': name, 'value': newValue},
     success:function(jsonData) {
      //  console.log(jsonData);
       let data = JSON.parse(jsonData);
       if (data.code === "200") {
         valueHtml.val(data.value);
         closeChoise(el);
       }
     }
    });
  }

  // Open edit panel
  $('#edit').click(function() {
    $(this).toggleClass('active');
    $('.edit').toggleClass('hidden');
    let editItems = $('.editable');
    editItems.prop("disabled", true);
    if ($(this).hasClass('active')) {
    } else {
      $('.account__item--name').removeClass('focus');
      $('.account__item--balance').removeClass('focus');
    }

  })

  // Open editing input
  $(document).on('click', '.account__edit', function () {
    $(this).toggleClass('hidden');
    let editItem = $(this).parent().siblings('input');
    editItem.prop("disabled", function( i, val ) {
      return !val;
    });
    editItem.focus();
    let tmpStr = editItem.val();
    editItem.val('');
    editItem.val(tmpStr);
    let confirmItems = $(this).siblings('.account__choise');
    $(confirmItems).toggleClass('hidden');
  });
  // Exit account editing
  $(document).on('click', '.account__choise--exit', function () {
    closeChoise($(this));
    let valueHtml = $(this).parent().siblings('input');
    let curValue = valueHtml.attr('data-val');
    valueHtml.val(curValue);
  });
  // Save account editing
  $(document).on('click', '.account__choise--confirm', function () {
    let name = $(this).parent().siblings('input').attr('name');
    let valueHtml = $(this).parent().siblings('input');
    let newValue = valueHtml.val();
    let curValue = valueHtml.attr('data-val');
    if (curValue !== newValue) {
      let res = inputValidate(newValue, name);
      if (res) {
        delFocus(valueHtml.parent());
        editAccount($(this));
      } else {
        setFocus(valueHtml.parent());
      }
    } else {
      delFocus(valueHtml.parent());
      closeChoise($(this));
    }
  });

  // Cat hover effect
  $(document).mouseup(function (e){
		let cats = $(".account__cat--active");
    let errorPopup = $('.num-error')
    for (var i = 0; i < cats.length; i++) {
      let cat = cats[i];
      let account = $(cat).parent().parent();
      if (!account.is(e.target) && account.has(e.target).length === 0 &&
          !errorPopup.is(e.target) && errorPopup.has(e.target).length === 0){
        $(cat).removeClass("account__cat--active");
      }
    }
	});

  // Adding new account
  $(document).on('click', '.add_account', function () {
    $.ajax({
     type: "POST",
     url: 'php/ajax.php',
     data:{'function': 'add_account'},
     success:function(jsonData) {
       let data = JSON.parse(jsonData);
       let id = data.id;
       let name = data.name;
       let balance = data.balance;
       if (data.code === "200") {
         let newAccount = `
         <div class="account" data-id="${id}">
           <div class="account__item account__item--name focus">
             <input class="account__name editable" data-val="<${name}" type="text" name="name" value="${name}">
             <div class="account__nav">
               <svg class="account__edit edit hidden" data-id="${id}" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 129 129" xmlns:xlink="http://www.w3.org/1999/xlink" enable-background="new 0 0 129 129">
                 <g>
                   <g>
                     <path d="m119.2,114.3h-109.4c-2.3,0-4.1,1.9-4.1,4.1s1.9,4.1 4.1,4.1h109.5c2.3,0 4.1-1.9 4.1-4.1s-1.9-4.1-4.2-4.1z"/>
                     <path d="m5.7,78l-.1,19.5c0,1.1 0.4,2.2 1.2,3 0.8,0.8 1.8,1.2 2.9,1.2l19.4-.1c1.1,0 2.1-0.4 2.9-1.2l67-67c1.6-1.6 1.6-4.2 0-5.9l-19.2-19.4c-1.6-1.6-4.2-1.6-5.9-1.77636e-15l-13.4,13.5-53.6,53.5c-0.7,0.8-1.2,1.8-1.2,2.9zm71.2-61.1l13.5,13.5-7.6,7.6-13.5-13.5 7.6-7.6zm-62.9,62.9l49.4-49.4 13.5,13.5-49.4,49.3-13.6,.1 .1-13.5z"/>
                   </g>
                 </g>
               </svg>
               <svg class="account__choise account__choise--confirm visible" data-id="${id}" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                  viewBox="0 0 17.837 17.837" style="enable-background:new 0 0 17.837 17.837;" xml:space="preserve">
                 <g>
                   <path  d="M16.145,2.571c-0.272-0.273-0.718-0.273-0.99,0L6.92,10.804l-4.241-4.27
                     c-0.272-0.274-0.715-0.274-0.989,0L0.204,8.019c-0.272,0.271-0.272,0.717,0,0.99l6.217,6.258c0.272,0.271,0.715,0.271,0.99,0
                     L17.63,5.047c0.276-0.273,0.276-0.72,0-0.994L16.145,2.571z"/>
                 </g>
               </svg>
               <svg class="account__choise account__choise--exit visible" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21.9 21.9" xmlns:xlink="http://www.w3.org/1999/xlink" enable-background="new 0 0 21.9 21.9">
                 <path d="M14.1,11.3c-0.2-0.2-0.2-0.5,0-0.7l7.5-7.5c0.2-0.2,0.3-0.5,0.3-0.7s-0.1-0.5-0.3-0.7l-1.4-1.4C20,0.1,19.7,0,19.5,0  c-0.3,0-0.5,0.1-0.7,0.3l-7.5,7.5c-0.2,0.2-0.5,0.2-0.7,0L3.1,0.3C2.9,0.1,2.6,0,2.4,0S1.9,0.1,1.7,0.3L0.3,1.7C0.1,1.9,0,2.2,0,2.4  s0.1,0.5,0.3,0.7l7.5,7.5c0.2,0.2,0.2,0.5,0,0.7l-7.5,7.5C0.1,19,0,19.3,0,19.5s0.1,0.5,0.3,0.7l1.4,1.4c0.2,0.2,0.5,0.3,0.7,0.3  s0.5-0.1,0.7-0.3l7.5-7.5c0.2-0.2,0.5-0.2,0.7,0l7.5,7.5c0.2,0.2,0.5,0.3,0.7,0.3s0.5-0.1,0.7-0.3l1.4-1.4c0.2-0.2,0.3-0.5,0.3-0.7  s-0.1-0.5-0.3-0.7L14.1,11.3z"/>
               </svg>
             </div>
           </div>
           <div class="account__item account__item--balance focus">
             <p class="account__curr">&#8372;</p>
             <input class="account__balance editable" data-val="<${balance}" data-id="${id}" type="text" name="balance" value="${balance}">
             <div class="account__nav">
               <svg class="account__edit edit hidden" data-id="${id}" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 129 129" xmlns:xlink="http://www.w3.org/1999/xlink" enable-background="new 0 0 129 129">
                 <g>
                   <g>
                     <path d="m119.2,114.3h-109.4c-2.3,0-4.1,1.9-4.1,4.1s1.9,4.1 4.1,4.1h109.5c2.3,0 4.1-1.9 4.1-4.1s-1.9-4.1-4.2-4.1z"/>
                     <path d="m5.7,78l-.1,19.5c0,1.1 0.4,2.2 1.2,3 0.8,0.8 1.8,1.2 2.9,1.2l19.4-.1c1.1,0 2.1-0.4 2.9-1.2l67-67c1.6-1.6 1.6-4.2 0-5.9l-19.2-19.4c-1.6-1.6-4.2-1.6-5.9-1.77636e-15l-13.4,13.5-53.6,53.5c-0.7,0.8-1.2,1.8-1.2,2.9zm71.2-61.1l13.5,13.5-7.6,7.6-13.5-13.5 7.6-7.6zm-62.9,62.9l49.4-49.4 13.5,13.5-49.4,49.3-13.6,.1 .1-13.5z"/>
                   </g>
                 </g>
               </svg>
               <svg class="account__choise account__choise--confirm" data-id="${id}" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                  viewBox="0 0 17.837 17.837" style="enable-background:new 0 0 17.837 17.837;" xml:space="preserve">
                 <g>
                   <path  d="M16.145,2.571c-0.272-0.273-0.718-0.273-0.99,0L6.92,10.804l-4.241-4.27
                     c-0.272-0.274-0.715-0.274-0.989,0L0.204,8.019c-0.272,0.271-0.272,0.717,0,0.99l6.217,6.258c0.272,0.271,0.715,0.271,0.99,0
                     L17.63,5.047c0.276-0.273,0.276-0.72,0-0.994L16.145,2.571z"/>
                 </g>
                 </g>
               </svg>
               <svg class="account__choise account__choise--exit" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21.9 21.9" xmlns:xlink="http://www.w3.org/1999/xlink" enable-background="new 0 0 21.9 21.9">
                 <path d="M14.1,11.3c-0.2-0.2-0.2-0.5,0-0.7l7.5-7.5c0.2-0.2,0.3-0.5,0.3-0.7s-0.1-0.5-0.3-0.7l-1.4-1.4C20,0.1,19.7,0,19.5,0  c-0.3,0-0.5,0.1-0.7,0.3l-7.5,7.5c-0.2,0.2-0.5,0.2-0.7,0L3.1,0.3C2.9,0.1,2.6,0,2.4,0S1.9,0.1,1.7,0.3L0.3,1.7C0.1,1.9,0,2.2,0,2.4  s0.1,0.5,0.3,0.7l7.5,7.5c0.2,0.2,0.2,0.5,0,0.7l-7.5,7.5C0.1,19,0,19.3,0,19.5s0.1,0.5,0.3,0.7l1.4,1.4c0.2,0.2,0.5,0.3,0.7,0.3  s0.5-0.1,0.7-0.3l7.5-7.5c0.2-0.2,0.5-0.2,0.7,0l7.5,7.5c0.2,0.2,0.5,0.3,0.7,0.3s0.5-0.1,0.7-0.3l1.4-1.4c0.2-0.2,0.3-0.5,0.3-0.7  s-0.1-0.5-0.3-0.7L14.1,11.3z"/>
               </svg>
             </div>
           </div>
           <div class="account__item account__item--sum">
             <input class="account__sum" data-id="${id}" type="number" min="1" placeholder="Сума" name="" value="">
           </div>
           <div class="account__item account__item--cats">
           ${catsHtml}
           </div>
           <div class="account__item account__item--comment">
             <input class="account__comment" data-id="${id}" placeholder="Коментар" type="text" name="" value="">
           </div>
           <div  class="account__item account__item--btns">
             <button class="account__btn" data-action="increase" data-action="+" data-id="${id}" type="button" name="button"><span>+</span></button>
             <button class="account__btn" data-action="decrease" data-action="-" data-id="${id}" type="button" name="button"><span>-</span></button>
           </div>
           <svg class="account__delete edit" data-id="${id}" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21.9 21.9" xmlns:xlink="http://www.w3.org/1999/xlink" enable-background="new 0 0 21.9 21.9">
             <path d="M14.1,11.3c-0.2-0.2-0.2-0.5,0-0.7l7.5-7.5c0.2-0.2,0.3-0.5,0.3-0.7s-0.1-0.5-0.3-0.7l-1.4-1.4C20,0.1,19.7,0,19.5,0  c-0.3,0-0.5,0.1-0.7,0.3l-7.5,7.5c-0.2,0.2-0.5,0.2-0.7,0L3.1,0.3C2.9,0.1,2.6,0,2.4,0S1.9,0.1,1.7,0.3L0.3,1.7C0.1,1.9,0,2.2,0,2.4  s0.1,0.5,0.3,0.7l7.5,7.5c0.2,0.2,0.2,0.5,0,0.7l-7.5,7.5C0.1,19,0,19.3,0,19.5s0.1,0.5,0.3,0.7l1.4,1.4c0.2,0.2,0.5,0.3,0.7,0.3  s0.5-0.1,0.7-0.3l7.5-7.5c0.2-0.2,0.5-0.2,0.7,0l7.5,7.5c0.2,0.2,0.5,0.3,0.7,0.3s0.5-0.1,0.7-0.3l1.4-1.4c0.2-0.2,0.3-0.5,0.3-0.7  s-0.1-0.5-0.3-0.7L14.1,11.3z"/>
           </svg>
         </div>
          `
        $('.accounts__inner').append($(newAccount));
        let newAcc = $('.account').last();
        $('.accounts__container').animate({
          scrollTop: $('.accounts__inner').scrollTop() + ($(newAcc).offset().top - $('.accounts__inner').offset().top)
        });
       }
     }
    });
  });

  // Delete account
  $(document).on('click', '.account__delete', function () {
    let res = confirm("Ви впевненні?");
    if (res) {
      let id = $(this).attr('data-id');
      $.ajax({
       type: "POST",
       url: 'php/ajax.php',
       data:{'function': 'delete_account', 'id': id},
       success:function(jsonData) {
         let data = JSON.parse(jsonData);
         if (data.code === "200") {
          let deletedAccount = $(".account[data-id='"+data.id+"']");
          deletedAccount.fadeOut();
         }
       }
      });
    }
  });

  // Error messages
  $('.num-error__btn').click(function() {
    $('.num-error').fadeOut();
  })

  // Delete history
  $(document).on('click', '#clearHistory', function () {
    let res = confirm("Ви впевненні?");
    if (res) {
      $.ajax({
       type: "POST",
       url: 'php/ajax.php',
       data:{'function': 'clear_history'},
       success:function(jsonData) {
         let data = JSON.parse(jsonData);
         if (data.code === "200") {
          $('.receipt').fadeOut();
          $('#clearHistory').removeClass('active');
         }
       }
      });
    }
  });


}());
