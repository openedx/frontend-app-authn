// เปิดโมดัลล็อกอิน
document.getElementById('open-login-modal').addEventListener('click', function() {
  document.getElementById('login-modal').style.display = 'block';
});

// เปิดโมดัลลงทะเบียน
document.getElementById('open-register-modal').addEventListener('click', function() {
  document.getElementById('register-modal').style.display = 'block';
});

// ปิดโมดัลเมื่อคลิกปุ่มปิด
document.querySelectorAll('.close-modal').forEach(function(closeBtn) {
  closeBtn.addEventListener('click', function() {
    this.closest('.modal').style.display = 'none';
  });
});

// ปิดโมดัลเมื่อคลิกนอกพื้นที่โมดัล
window.addEventListener('click', function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.style.display = 'none';
  }
});
