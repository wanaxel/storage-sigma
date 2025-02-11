document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-input');
    const statusDiv = document.getElementById('upload-status');
    const fileList = document.getElementById('file-list');
    const filePreview = document.getElementById('file-preview');

    const showStatus = (message, isError = false) => {
        statusDiv.className = isError ? 'error' : 'success';
        statusDiv.textContent = message;
        statusDiv.style.display = 'block';

        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    };

    const addFileToList = (filename) => {
        const li = document.createElement('li');
        li.className = 'file-item';

        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';

        const icon = document.createElement('i');
        const isImage = filename.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);
        icon.className = isImage ? 'fas fa-image' : 'fas fa-file';
        
        const link = document.createElement('a');
        link.href = `/download/${filename}`;
        link.textContent = filename;

        fileInfo.appendChild(icon);
        fileInfo.appendChild(link);
        li.appendChild(fileInfo);

        if (isImage) {
            const imagePreview = document.createElement('div');
            imagePreview.className = 'image-preview';
            const img = document.createElement('img');
            img.src = `/download/${filename}`;
            img.alt = filename;
            img.loading = 'lazy';
            imagePreview.appendChild(img);
            li.appendChild(imagePreview);
        }

        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.addEventListener('click', () => deleteFile(filename, li));

        li.appendChild(deleteBtn);
        fileList.insertBefore(li, fileList.firstChild);
    };

    const deleteFile = async (filename, listItem) => {
        try {
            const response = await fetch(`/delete/${filename}`, { method: 'DELETE' });
            const data = await response.json();

            if (response.ok) {
                showStatus('File deleted successfully!');
                listItem.remove();
            } else {
                throw new Error(data.error || 'Delete failed');
            }
        } catch (error) {
            showStatus(`Delete failed: ${error.message}`, true);
        }
    };

    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        filePreview.innerHTML = '';

        if (file && file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            filePreview.appendChild(img);
        }
    });

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        const file = fileInput.files[0];
        
        if (!file) {
            showStatus('Please select a file first', true);
            return;
        }

        formData.append('file', file);
        
        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (response.ok) {
                addFileToList(data.filename);
                showStatus('File uploaded successfully!');
                fileInput.value = '';
                filePreview.innerHTML = '';
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (error) {
            showStatus(`Upload failed: ${error.message}`, true);
        }
    });

    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const filename = this.previousElementSibling.querySelector('a').textContent;
            deleteFile(filename, this.parentElement);
        });
    });
});

