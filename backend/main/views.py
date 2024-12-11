import json
from datetime import datetime

from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from . import models, serializers
from .openai import client


class SignUpView(APIView):
    permission_classes = []

    def post(self, request, *args, **kwargs):
        serializer = serializers.UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(ObtainAuthToken):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        token, created = Token.objects.get_or_create(user=user)
        return Response(
            {
                "token": token.key,
                "user_id": user.pk,
                "username": user.username,
                "email": user.email,
            }
        )


class GenerateSentenceAPIView(APIView):
    def post(self, request, *args, **kwargs):
        session = None
        session_id = request.data.get("session_id", None)

        if not session_id:
            session = models.Session.objects.create(user=request.user)
        else:
            session = models.Session.objects.get(id=session_id)

        messages = json.loads(session.messages)

        if not request.data:
            return Response(
                {"error": "Request body is empty"}, status=status.HTTP_400_BAD_REQUEST
            )
        try:
            text_input = request.data["input"]
        except KeyError:
            return Response(
                {"error": "Missing 'input' key in request body"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not text_input:
            return Response(
                {"error": "Input text is empty"}, status=status.HTTP_400_BAD_REQUEST
            )
        try:
            gpt_response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "user",
                        "content": f"generate a sentence with {text_input} these words",
                    }
                ],
            )
        except Exception as e:
            return Response(
                {"error": f"GPT-4 completion failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        if not gpt_response or not gpt_response.choices:
            return Response(
                {"error": "Invalid GPT-4 response"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        response = gpt_response.choices[0].message.content
        messages.append(
            {
                "user": text_input,
                "response": response,
                "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            }
        )
        session.messages = json.dumps(messages)
        session.save()
        return Response(response, status=status.HTTP_200_OK)
