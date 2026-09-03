from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger('django')

def custom_exception_handler(exc, context):
    """
    Standardizes error responses across all Jamia Islamia REST endpoints.
    Format:
    {
        "success": false,
        "error": {
            "code": "STATUS_CODE",
            "message": "Human readable message",
            "details": {...}
        }
    }
    """
    response = exception_handler(exc, context)

    if response is not None:
        error_message = "An error occurred."
        if isinstance(response.data, dict):
            if 'detail' in response.data:
                error_message = response.data['detail']
            else:
                error_message = "Validation or processing error."
        elif isinstance(response.data, list):
            error_message = response.data[0] if response.data else error_message

        custom_data = {
            'success': False,
            'error': {
                'code': response.status_code,
                'message': str(error_message),
                'details': response.data
            }
        }
        response.data = custom_data
    else:
        logger.error(f"Unhandled exception in API context: {context}", exc_info=exc)
        return Response(
            {
                'success': False,
                'error': {
                    'code': status.HTTP_500_INTERNAL_SERVER_ERROR,
                    'message': 'An internal server error occurred.',
                    'details': str(exc) if getattr(context.get('request'), 'debug', False) else None
                }
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return response
