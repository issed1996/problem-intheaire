from django.db import models

class FileUpload(models.Model):
    file_name = models.CharField(max_length=255)
    file_size = models.BigIntegerField()
    upload_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file_name

class FileChunk(models.Model):
    file = models.ForeignKey(FileUpload, on_delete=models.CASCADE)
    chunk_number = models.IntegerField()
    total_chunks = models.IntegerField()
    chunk = models.FileField(upload_to='chunks/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chunk {self.chunk_number} of {self.file.file_name}"
