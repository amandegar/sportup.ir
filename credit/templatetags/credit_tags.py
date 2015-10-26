from django import template
from django.db.models import Sum
from credit.models import userCredit

register = template.Library()

# -----------------------------------------------------------------------
@register.simple_tag(takes_context=True)
def get_credit(context):
    request = context['request']
    validCredits = userCredit.objects.active(request.user).aggregate(overallCredit = Sum('value'))
    return validCredits['overallCredit']
# -----------------------------------------------------------------------
