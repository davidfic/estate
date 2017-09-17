from __future__ import absolute_import
from django.contrib import admin
from django.apps import apps

Namespace = apps.get_model('terraform.Namespace')


class NamespaceAdmin(admin.ModelAdmin):
    list_display = ['pk', 'title', 'owner', 'locked', 'locking_user']
    list_editable = ['title', 'owner']
    list_filter = ['title']
    search_fields = ['slug', 'title']
    list_per_page = 10


admin.site.register(Namespace, NamespaceAdmin)
