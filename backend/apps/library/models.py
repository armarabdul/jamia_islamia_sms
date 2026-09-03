from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import TimeStampedModel
from django.conf import settings

class Book(TimeStampedModel):
    class Category(models.TextChoices):
        QURAN_TAFSEER = 'TAFSEER', _('Quran & Tafseer')
        HADITH = 'HADITH', _('Hadith & Sunnah')
        FIQH = 'FIQH', _('Fiqh & Jurisprudence')
        ARABIC = 'ARABIC', _('Arabic Language & Literature')
        URDU = 'URDU', _('Urdu Literature')
        ENGLISH = 'ENGLISH', _('English Literature')
        SCIENCE = 'SCIENCE', _('Science & Technology')
        MATHEMATICS = 'MATHEMATICS', _('Mathematics')
        HISTORY = 'HISTORY', _('History & Biographies')
        GENERAL = 'GENERAL', _('General Knowledge')

    title = models.CharField(_('Book Title'), max_length=200)
    title_urdu = models.CharField(_('Book Title (Urdu)'), max_length=200, blank=True, default='')
    author = models.CharField(_('Author / Scholar'), max_length=150)
    author_urdu = models.CharField(_('Author (Urdu)'), max_length=150, blank=True, default='')
    isbn = models.CharField(_('ISBN / Unique Code'), max_length=50, blank=True, default='')
    category = models.CharField(_('Category'), max_length=30, choices=Category.choices, default=Category.GENERAL)
    publisher = models.CharField(_('Publisher'), max_length=150, blank=True, default='')
    edition = models.CharField(_('Edition / Volume'), max_length=50, blank=True, default='')
    total_copies = models.PositiveIntegerField(_('Total Copies'), default=1)
    available_copies = models.PositiveIntegerField(_('Available Copies'), default=1)
    shelf_location = models.CharField(_('Shelf Location'), max_length=50, blank=True, default='')

    class Meta:
        ordering = ['title']
        verbose_name = _('Book')
        verbose_name_plural = _('Books')

    def __str__(self):
        return f"{self.title} - {self.author} ({self.get_category_display()})"


class BookCopy(TimeStampedModel):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='copies')
    accession_number = models.CharField(_('Accession / Barcode Number'), max_length=50, unique=True, db_index=True)
    is_available = models.BooleanField(_('Is Available for Loan'), default=True)

    class Meta:
        verbose_name = _('Book Copy')
        verbose_name_plural = _('Book Copies')

    def __str__(self):
        return f"{self.book.title} [Acc: {self.accession_number}]"


class BookTransaction(TimeStampedModel):
    class Status(models.TextChoices):
        ISSUED = 'ISSUED', _('Issued')
        RETURNED = 'RETURNED', _('Returned')
        OVERDUE = 'OVERDUE', _('Overdue')
        LOST = 'LOST', _('Lost / Damaged')

    book_copy = models.ForeignKey(BookCopy, on_delete=models.CASCADE, related_name='transactions')
    borrower = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='book_loans')
    issue_date = models.DateField(_('Issue Date'), auto_now_add=True)
    due_date = models.DateField(_('Due Date'))
    return_date = models.DateField(_('Return Date'), null=True, blank=True)
    status = models.CharField(_('Status'), max_length=20, choices=Status.choices, default=Status.ISSUED)
    fine_amount = models.DecimalField(_('Fine Amount (INR)'), max_digits=6, decimal_places=2, default=0.00)
    issued_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='issued_books')
    notes = models.CharField(_('Notes'), max_length=255, blank=True, default='')

    class Meta:
        ordering = ['-issue_date']
        verbose_name = _('Book Transaction')
        verbose_name_plural = _('Book Transactions')

    def __str__(self):
        return f"{self.book_copy.book.title} -> {self.borrower.username} ({self.status})"
