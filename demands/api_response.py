from rest_framework.response import Response


def success_response(*, data=None, status_code=200):
    return Response(
        {
            "success": True,
            "data": data,
            "error": None,
        },
        status=status_code,
    )


def error_response(*, code, detail, status_code=400):
    return Response(
        {
            "success": False,
            "data": None,
            "error": {
                "code": code,
                "detail": detail,
            },
        },
        status=status_code,
    )