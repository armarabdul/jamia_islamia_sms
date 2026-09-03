from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookViewSet, BookTransactionViewSet

router = DefaultRouter()
router.register(r'books', BookViewSet, basename='book')
router.register(r'transactions', BookTransactionViewSet, basename='book-transaction')

urlpatterns = [
    path('', include(router.urls)),
]
