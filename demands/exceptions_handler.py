from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.views import exception_handler

from demands.exceptions import (
    DemandDomainError,
    InvalidReassignmentOperationError,
    InvalidStandbyOperationError,
    InvalidStatusTransitionError,
    NoDemandAvailableError,
)


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if isinstance(exc, ValidationError):
        return response

    if isinstance(exc, NoDemandAvailableError):
        from rest_framework.response import Response
        return Response(
            {
                "success": False,
                "data": None,
                "error": {
                    "code": "no_demand_available",
                    "detail": str(exc),
                },
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    if isinstance(exc, InvalidStatusTransitionError):
        from rest_framework.response import Response
        return Response(
            {
                "success": False,
                "data": None,
                "error": {
                    "code": "invalid_status_transition",
                    "detail": str(exc),
                },
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if isinstance(exc, InvalidStandbyOperationError):
        from rest_framework.response import Response
        return Response(
            {
                "success": False,
                "data": None,
                "error": {
                    "code": "invalid_standby_operation",
                    "detail": str(exc),
                },
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if isinstance(exc, InvalidReassignmentOperationError):
        from rest_framework.response import Response
        return Response(
            {
                "success": False,
                "data": None,
                "error": {
                    "code": "invalid_reassignment_operation",
                    "detail": str(exc),
                },
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if isinstance(exc, DemandDomainError):
        from rest_framework.response import Response
        return Response(
            {
                "success": False,
                "data": None,
                "error": {
                    "code": "demand_domain_error",
                    "detail": str(exc),
                },
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    return response