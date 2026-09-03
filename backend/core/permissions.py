from rest_framework import permissions

class IsAdminUserRole(permissions.BasePermission):
    """
    Allows access only to users with ADMIN role or Django is_staff/is_superuser.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and (
                getattr(request.user, 'role', '') == 'ADMIN' or
                request.user.is_superuser or
                request.user.is_staff
            )
        )

class IsTeacherUserRole(permissions.BasePermission):
    """
    Allows access to users with TEACHER or ADMIN role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and (
                getattr(request.user, 'role', '') in ('TEACHER', 'ADMIN') or
                request.user.is_superuser
            )
        )

class IsStudentUserRole(permissions.BasePermission):
    """
    Allows access to users with STUDENT role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and (
                getattr(request.user, 'role', '') in ('STUDENT', 'ADMIN') or
                request.user.is_superuser
            )
        )

class IsParentUserRole(permissions.BasePermission):
    """
    Allows access to users with PARENT role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and (
                getattr(request.user, 'role', '') in ('PARENT', 'ADMIN') or
                request.user.is_superuser
            )
        )

class IsStaffUserRole(permissions.BasePermission):
    """
    Allows access to users with STAFF, TEACHER, or ADMIN role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and (
                getattr(request.user, 'role', '') in ('STAFF', 'TEACHER', 'ADMIN') or
                request.user.is_superuser
            )
        )

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to edit it,
    or administrators.
    """
    def has_object_permission(self, request, view, obj):
        if getattr(request.user, 'role', '') == 'ADMIN' or request.user.is_superuser:
            return True
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'user_id'):
            return obj.user_id == request.user.id
        return False
