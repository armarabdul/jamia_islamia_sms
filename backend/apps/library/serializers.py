from rest_framework import serializers
from .models import Book, BookCopy, BookTransaction
from apps.accounts.serializers import UserSerializer

class BookCopySerializer(serializers.ModelSerializer):
    class Meta:
        model = BookCopy
        fields = ['id', 'book', 'accession_number', 'is_available']
        read_only_fields = ['id']


class BookSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    copies = BookCopySerializer(many=True, read_only=True)

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'title_urdu', 'author', 'author_urdu', 'isbn',
            'category', 'category_display', 'publisher', 'edition',
            'total_copies', 'available_copies', 'shelf_location', 'copies', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class BookTransactionSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book_copy.book.title', read_only=True)
    book_title_urdu = serializers.CharField(source='book_copy.book.title_urdu', read_only=True)
    accession_number = serializers.CharField(source='book_copy.accession_number', read_only=True)
    borrower_name = serializers.CharField(source='borrower.get_full_name', read_only=True)
    borrower_username = serializers.CharField(source='borrower.username', read_only=True)

    class Meta:
        model = BookTransaction
        fields = [
            'id', 'book_copy', 'accession_number', 'book_title', 'book_title_urdu',
            'borrower', 'borrower_name', 'borrower_username', 'issue_date',
            'due_date', 'return_date', 'status', 'fine_amount', 'issued_by',
            'notes', 'created_at'
        ]
        read_only_fields = ['id', 'issue_date', 'created_at']
