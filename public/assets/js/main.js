"use strict";
/* =========================================================
   PAGE LOADER
========================================================= */
$(window).on("load", function () {
  setTimeout(function () {
    $(".loader, .loader-mask").fadeOut("slow");
  }, 500);
});
/* =========================================================
   DOCUMENT READY
========================================================= */
$(document).ready(function () {
  /* ---------------------------------------------------------
     SUBSCRIBE FORM MESSAGE
  --------------------------------------------------------- */
  $(document).on("click", ".subscribe button", function () {
    const $emailInput = $('.subscribe input[type="email"]');
    const email = $.trim($emailInput.val());
    const $thankYouMessage = $("#thankYouMessage");
    if (email !== "") {
      $emailInput.val("");
      $thankYouMessage.addClass("show");
      setTimeout(function () {
        $thankYouMessage.removeClass("show");
      }, 3000);
    }
  });
  /* ---------------------------------------------------------
     FIXED FIRST PAGE HIDE
  --------------------------------------------------------- */
  $(".button-top-all-design").on("click", function () {
    const $page = $(".fixed-first-page");
    $page.addClass("hide");
    setTimeout(function () {
      $page.css("display", "none");
    }, 2000);
  });
  /* ---------------------------------------------------------
     PAYMENT SUCCESS (THANK YOU + CONFETTI)
  --------------------------------------------------------- */
  function launchConfetti() {
    const $wrapper = $(".confetti-wrapper");
    $wrapper.empty();
    const colors = [
      "#fbbc04",
      "#ea4335",
      "#34a853",
      "#4285f4",
      "#ffcc00",
      "#ff6d01",
      "#46bdc6",
    ];
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 160 + Math.random() * 80;
      $("<div>", { class: "confetti" })
        .css({
          "--x": `${Math.cos(angle) * distance}px`,
          "--y": `${Math.sin(angle) * distance}px`,
          "background-color": colors[Math.floor(Math.random() * colors.length)],
          "animation-delay": `${Math.random() * 0.5}s`,
        })
        .appendTo($wrapper);
    }
  }
  $(document).on("click", "#Submit", function () {
    const $thankYou = $(".thank-you");
    if ($thankYou.length) {
      $thankYou.css("display", "flex").addClass("show");
      const $svg = $thankYou.find("svg.checkmark");
      $svg.replaceWith($svg.clone());
      setTimeout(launchConfetti, 600);
    }
  });
  /* ---------------------------------------------------------
     OPTION SELECTION WITH RIPPLE EFFECT
  --------------------------------------------------------- */
  function createRipple(e, element) {
    element.find(".ripple").remove();
    const offset = element.offset();
    const x = e.pageX - offset.left;
    const y = e.pageY - offset.top;
    const ripple = $('<span class="ripple"></span>').css({
      top: y,
      left: x,
      width: 100,
      height: 100,
    });
    element.append(ripple);
    setTimeout(() => ripple.remove(), 600);
  }
  $(document).on("click", ".option-selected", function (e) {
    $(this)
      .closest(".option-design")
      .find(".option-selected")
      .removeClass("active");
    $(this).addClass("active");
    createRipple(e, $(this));
  });
  /* ---------------------------------------------------------
     BUTTON RIPPLE EFFECT (NEXT / PREV)
  --------------------------------------------------------- */
  $(".button-deta-design button").on("click", function (e) {
    createRipple(e, $(this));
  });
  /* ---------------------------------------------------------
     STEP BASED QUESTION FLOW
  --------------------------------------------------------- */
  let currentStep = 0;
  const $steps = $(".steps");
  const totalSteps = $steps.length;
  let countdown;
  function updateButtons() {
    $("#prev").toggle(currentStep > 0);
    $("#next").toggle(currentStep < totalSteps - 1);
    $("#Submit").toggle(currentStep === totalSteps - 1);
  }
  function showStep(index, direction) {
    clearInterval(countdown);
    startTimer();
    $steps.hide().removeClass("active slide-from-top slide-from-bottom");
    const animation =
      direction === "next" ? "slide-from-top" : "slide-from-bottom";
    $steps.eq(index).addClass(`active ${animation}`).show();
    $(".changing").text(String(index + 1).padStart(2, "0"));
  }
  function startTimer() {
    let seconds = 59;
    $("#runing-data").text(seconds);
    countdown = setInterval(function () {
      seconds--;
      if (seconds >= 0) {
        $("#runing-data").text(seconds < 10 ? "0" + seconds : seconds);
      } else {
        clearInterval(countdown);
        autoNextStep();
      }
    }, 1000);
  }
  function autoNextStep() {
    if (currentStep < totalSteps - 1) {
      currentStep++;
      showStep(currentStep, "next");
      updateButtons();
    }
  }
  function showError(message) {
    $("#error-message").text(message).addClass("show");
    setTimeout(() => $("#error-message").removeClass("show"), 2000);
  }
  $("#next").on("click", function () {
    if (!$steps.eq(currentStep).find(".option-selected.active").length) {
      showError("Please select an option before proceeding.");
      return;
    }
    currentStep++;
    showStep(currentStep, "next");
    updateButtons();
  });
  $("#prev").on("click", function () {
    currentStep--;
    showStep(currentStep, "prev");
    updateButtons();
  });
  /* INITIAL LOAD */
  $steps.hide().eq(0).show().addClass("active");
  updateButtons();
  startTimer();
});
