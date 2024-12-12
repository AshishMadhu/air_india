import json
from datetime import datetime

from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.generics import ListAPIView, RetrieveAPIView
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
        session_title = request.data.get("session_title", None)

        if not session_id:
            session = models.Session.objects.create(
                user=request.user, title=session_title
            )
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
        if text_input == "Graph" or text_input == "graph":
            messages.append(
                {
                    "user": text_input,
                    "assistant": "#",
                    "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                }
            )
            session.messages = json.dumps(messages)
            session.save()
            return Response("#", status=status.HTTP_200_OK)
        elif text_input == "BarPlot":
            messages.append(
                {
                    "user": text_input,
                    "assistant": "#1",
                    "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                }
            )
            session.messages = json.dumps(messages)
            session.save()
            return Response("#1", status=status.HTTP_200_OK)
        elif text_input == "PiePlot":
            messages.append(
                {
                    "user": text_input,
                    "assistant": "#2",
                    "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                }
            )
            session.messages = json.dumps(messages)
            session.save()
            return Response("#2", status=status.HTTP_200_OK)
        elif text_input == "ScatterPlot":
            messages.append(
                {
                    "user": text_input,
                    "assistant": "#3",
                    "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                }
            )
            session.messages = json.dumps(messages)
            session.save()
            return Response("#3", status=status.HTTP_200_OK)
        elif text_input == "LinePlot":
            messages.append(
                {
                    "user": text_input,
                    "assistant": "#4",
                    "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                }
            )
            session.messages = json.dumps(messages)
            session.save()
            return Response("#4", status=status.HTTP_200_OK)
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
                "assistant": response,
                "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            }
        )
        session.messages = json.dumps(messages)
        session.save()
        return Response(response, status=status.HTTP_200_OK)


class SessionListView(ListAPIView):
    serializer_class = serializers.SessionSerializer

    def get_queryset(self):
        return self.request.user.session_set.all()


class MessageListView(RetrieveAPIView):
    serializer_class = serializers.MessageSerializer
    lookup_field = "id"

    def get_queryset(self):
        return self.request.user.session_set.filter(id=self.kwargs.get("id"))
