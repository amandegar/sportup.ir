from django.conf.urls import patterns, include, url

from rest_framework.routers import DefaultRouter

import views

# ----------------------------------------------------
# router = DefaultRouter()
# router.register(r'enroll_session', views.enrollSession, 'enroll')

urlpatterns = patterns('',
    url(r'^enroll_session/(?P<club>\d+)/(?P<week>\d+)/(?P<id>\d+)/$',views.enrollSession.as_view()),
    url(r'^enroll_session_list/$',views.enrollSessionList.as_view()),
    url(r'^enroll_session_list_club/(?P<agreement>\d+)/$',views.enrollSessionListClub.as_view()),
)

# urlpatterns += router.urls

