# Generated by Django 5.1.4 on 2024-12-12 05:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='session',
            name='name',
            field=models.CharField(default='New Chat', max_length=100),
        ),
    ]
