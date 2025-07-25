# Generated by Django 4.1.5 on 2025-04-26 04:57

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("solarflare", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="project",
            name="model_file",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="model_projects",
                to="solarflare.resultfile",
            ),
        ),
        migrations.AlterField(
            model_name="project",
            name="result_file",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="result_projects",
                to="solarflare.resultfile",
            ),
        ),
    ]
