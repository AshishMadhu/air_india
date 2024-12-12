import json
from datetime import datetime

from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Session


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User(email=validated_data["email"], username=validated_data["username"])
        user.set_password(validated_data["password"])
        user.save()
        return user


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = ["all_messages"]


class SessionSerializer(serializers.ModelSerializer):
    messages = serializers.SerializerMethodField()

    def get_messages(self, instance):
        messages = json.loads(instance.messages)
        formatted_messages = []
        for message in messages:
            formatted_messages.extend(
                [
                    {
                        "id": str(datetime.now()),
                        "text": message["user"],
                        "sender": "user",
                    },
                    {
                        "id": str(datetime.now()),
                        "text": message.get("assistant", None),
                        "sender": "assistant",
                    },
                ]
            )
        return formatted_messages

    class Meta:
        model = Session
        fields = ["id", "title", "messages"]
