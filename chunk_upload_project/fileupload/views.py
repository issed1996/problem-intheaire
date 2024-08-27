import os
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import FileUpload, FileChunk
from .serializers import FileUploadSerializer, FileChunkSerializer

class FileUploadView(APIView):
    def post(self, request):
        file_name = request.data['file_name']
        chunk_number = int(request.data['chunk_number'])
        total_chunks = int(request.data['total_chunks'])
        chunk_file = request.FILES['chunk']

        file_upload, created = FileUpload.objects.get_or_create(
            file_name=file_name,
            defaults={'file_size': request.data['file_size']}
        )

        FileChunk.objects.create(
            file=file_upload,
            chunk_number=chunk_number,
            total_chunks=total_chunks,
            chunk=chunk_file
        )

        # Check if all chunks have been uploaded
        if FileChunk.objects.filter(file=file_upload).count() == total_chunks:
            # Reconstruct the file
            with open(os.path.join(settings.MEDIA_ROOT, file_name), 'wb') as complete_file:
                for chunk_num in range(1, total_chunks + 1):
                    chunk = FileChunk.objects.get(file=file_upload, chunk_number=chunk_num)
                    complete_file.write(chunk.chunk.read())

            # Optionally, delete the chunk files from the server
            FileChunk.objects.filter(file=file_upload).delete()

        return Response(status=status.HTTP_201_CREATED)

    def get(self, request):
        files = FileUpload.objects.all()
        serializer = FileUploadSerializer(files, many=True)
        return Response(serializer.data)

    def delete(self, request, pk):
        try:
            file = FileUpload.objects.get(pk=pk)
            file.delete()
            file_path = os.path.join(settings.MEDIA_ROOT, file.file_name)
            if os.path.exists(file_path):
                os.remove(file_path)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except FileUpload.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
