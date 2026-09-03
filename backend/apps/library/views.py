from datetime import date
from django.db import transaction
from django.db.models import Q
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Book, BookCopy, BookTransaction
from .serializers import BookSerializer, BookCopySerializer, BookTransactionSerializer
from core.permissions import IsAdminUserRole, IsStaffUserRole

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all().prefetch_related('copies')
    serializer_class = BookSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsStaffUserRole()]

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search')
        category = self.request.query_params.get('category')
        if search:
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(author__icontains=search) |
                Q(isbn__icontains=search) |
                Q(title_urdu__icontains=search)
            )
        if category:
            qs = qs.filter(category=category)
        return qs


class BookTransactionViewSet(viewsets.ModelViewSet):
    queryset = BookTransaction.objects.all().select_related('book_copy__book', 'borrower', 'issued_by')
    serializer_class = BookTransactionSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'my_loans']:
            return [permissions.IsAuthenticated()]
        return [IsStaffUserRole()]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if getattr(user, 'role', '') in ['STUDENT', 'PARENT']:
            qs = qs.filter(borrower=user)
        return qs

    @action(detail=False, methods=['get'])
    def my_loans(self, request):
        loans = BookTransaction.objects.filter(borrower=request.user).select_related('book_copy__book')
        return Response(BookTransactionSerializer(loans, many=True).data)

    @action(detail=False, methods=['post'], permission_classes=[IsStaffUserRole])
    def issue_book(self, request):
        """
        Fast checkout endpoint for school librarian.
        """
        accession_num = request.data.get('accession_number')
        borrower_id = request.data.get('borrower_id')
        due_date_val = request.data.get('due_date')

        copy = BookCopy.objects.filter(accession_number=accession_num, is_available=True).first()
        if not copy:
            return Response({'detail': 'Book copy not found or is currently checked out.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            copy.is_available = False
            copy.save()
            copy.book.available_copies = max(0, copy.book.available_copies - 1)
            copy.book.save()

            tx = BookTransaction.objects.create(
                book_copy=copy,
                borrower_id=borrower_id,
                due_date=due_date_val,
                status=BookTransaction.Status.ISSUED,
                issued_by=request.user
            )

        return Response(BookTransactionSerializer(tx).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[IsStaffUserRole])
    def return_book(self, request, pk=None):
        """
        Fast check-in endpoint for school librarian.
        """
        tx = self.get_object()
        if tx.status == BookTransaction.Status.RETURNED:
            return Response({'detail': 'Book has already been returned.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            tx.status = BookTransaction.Status.RETURNED
            tx.return_date = date.today()
            tx.fine_amount = request.data.get('fine_amount', 0.00)
            tx.notes = request.data.get('notes', tx.notes)
            tx.save()

            copy = tx.book_copy
            copy.is_available = True
            copy.save()
            copy.book.available_copies += 1
            copy.book.save()

        return Response(BookTransactionSerializer(tx).data, status=status.HTTP_200_OK)
