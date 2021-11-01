// function openNav() {
//   console.log("open");
//   let sideNav = document.getElementById("side-nav");
//   let openBtn = document.getElementById("open-btn");
//   let closeBtn = document.getElementById("close-btn");
//   console.log("open-btn ", openBtn.style.display);
//   console.log("close-btn ", closeBtn.style.display);
//   sideNav.classList.toggle("active");
//   if (closeBtn.style.display === "none") {
//     closeBtn.style.display = "block";
//     console.log("close-btn ", closeBtn.style.display);
//   }
//   if (openBtn.style.display !== "none") {
//     openBtn.style.display = "none";
//     console.log("open-btn ", openBtn.style.display);
//   }
// }

// function closeNav() {
//   console.log("close");
//   let sideNav = document.getElementById("side-nav");
//   let openBtn = document.getElementById("open-btn");
//   let closeBtn = document.getElementById("close-btn");
//   console.log("open-btn ", openBtn.style.display);
//   console.log("close-btn ", closeBtn.style.display);
//   sideNav.classList.toggle("active");
//   if (openBtn.style.display === "none") {
//     openBtn.style.display = "block";
//     console.log("open-btn ", openBtn.style.display);
//   }
//   if (closeBtn.style.display !== "none") {
//     closeBtn.style.display = "none";
//     console.log("close-btn ", closeBtn.style.display);
//   }
// }

// // MODAL
// var modal = document.getElementById("myModal");
// var btn = document.getElementsByClassName("myBtn");
// var span = document.getElementsByClassName("close")[0];
// //console.log(modal, btn, span)

// for(let i = 0; i < btn.length; i++) {
//   btn[i].onclick = function () {
//     modal.style.display = "block";
//     // fetch('/path', {
//     //   headers:{
//     //     'c':'',
//     //   }
//     // })
//     // .then((res)=> {
//     //   retun res.json()
//     // })
//     // .then(()=>{

//     // })
//     // .catch
//   }
// }

// span.onclick = function() {
//   modal.style.display = "none";
// }

// window.onclick = function(event) {
//   if (event.target == modal) {
//     modal.style.display = "none";
//   }
// }
