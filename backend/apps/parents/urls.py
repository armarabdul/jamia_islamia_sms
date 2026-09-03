from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ParentViewSet, MyChildrenView, LinkChildView

router = DefaultRouter()
router.register(r'', ParentViewSet, basename='parent')

urlpatterns = [
    path('my-children/', MyChildrenView.as_view(), name='parent_my_children'),
    path('link-child/', LinkChildView.as_view(), name='parent_link_child'),
    path('', include(router.urls)),
]
