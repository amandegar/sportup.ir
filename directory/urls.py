from __future__ import unicode_literals

from django.conf.urls import patterns, url
from directory import views

urlpatterns = patterns('',
        url(r'^$', views.listAllItems.as_view(), name='directoryListAllItems'),
        url(r'^(?P<slug>.*)/$', views.itemDetail.as_view(), name='directoryItemDetail'),
        url(r'^register/$', views.clubRegistration.as_view(), name='directoryRegistration'),
        )