$(document).ready(function() {
  $.ajax({
    url: 'http://numbersapi.com/1/30/date?json',
    method: 'GET',
    success: function(data) {
      $('.hero-section .container').append(`
        <div class="fact-container animate__animated animate__fadeIn animate__delay-2s text-center p-4 bg-light bg-opacity-75 rounded mx-auto" style="max-width: 600px; backdrop-filter: blur(5px);">
          <p class="mb-1 text-black">${data.text}</p>
          <small class="text-muted">On this day in history (${data.number} ${data.type})</small>
        </div>
      `);
    },
    error: function() {
      $('.hero-section .container').append(`
        <div class="fact-container animate__animated animate__fadeIn animate__delay-2s text-center p-4 bg-light bg-opacity-75 rounded mx-auto" style="max-width: 600px; backdrop-filter: blur(5px);">
          <p class="mb-0">Regular exercise can improve your mood and reduce stress!</p>
        </div>
      `);
    }
  });

  const fileInput = $('#fileInput');
  const uploadBtn = $('#uploadBtn');
  const previewContainer = $('#previewContainer');
  let files = [];


  fileInput.on('change', function() {
    files = this.files;
    handleFiles(files);
  });


  const uploadArea = $('.upload-area');
  
  uploadArea.on('dragover', function(e) {
    e.preventDefault();
    $(this).addClass('border-primary bg-light');
  });
  
  uploadArea.on('dragleave', function() {
    $(this).removeClass('border-primary bg-light');
  });
  
  uploadArea.on('drop', function(e) {
    e.preventDefault();
    $(this).removeClass('border-primary bg-light');
    files = e.originalEvent.dataTransfer.files;
    handleFiles(files);
  });


  function handleFiles(filesToProcess) {
    previewContainer.empty().removeClass('justify-content-start').addClass('justify-content-center');
    
    if (filesToProcess.length > 0) {
      uploadBtn.prop('disabled', false);
      
      Array.from(filesToProcess).forEach(file => {
        if (!file.type.startsWith('image/')) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
          previewContainer.append(`
            <div class="preview-image position-relative m-2">
              <img src="${e.target.result}" class="img-thumbnail" style="width: 120px; height: 120px; object-fit: cover;">
              <span class="remove-image position-absolute top-0 end-0 translate-middle bg-danger text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 24px; height: 24px; cursor: pointer;">&times;</span>
            </div>
          `);
        };
        reader.readAsDataURL(file);
      });
    } else {
      uploadBtn.prop('disabled', true);
    }
  }

  previewContainer.on('click', '.remove-image', function() {
    const index = $(this).parent().index();
    files = Array.from(files).filter((_, i) => i !== index);
    $(this).parent().remove();
    if (files.length === 0) {
      uploadBtn.prop('disabled', true);
      previewContainer.removeClass('justify-content-center').addClass('justify-content-start');
    }
  });


  uploadBtn.on('click', function() {
    if (files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    $(this).prop('disabled', true).html(`
      <span class="spinner-border spinner-border-sm"></span> Uploading...
    `);

    $.ajax({
      url: '/api/upload',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function(response) {
        alert('Files uploaded successfully!');
        previewContainer.empty().removeClass('justify-content-center').addClass('justify-content-start');
        fileInput.val('');
      },
      error: function(xhr) {
        alert('Error: ' + (xhr.responseJSON?.error || 'Upload failed'));
      },
      complete: function() {
        uploadBtn.prop('disabled', false).text('Upload Images');
      }
    });
  });
});