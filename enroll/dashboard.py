from django.utils.translation import ugettext_lazy as _
from generic.models import Displayable

from accounts.functions import dashboardBody
from enroll.models import enrolledProgram

# -----------------------------------------------------------------------
def generateMenu():
    menu = {'title':_('Enrollment'),
            'class':'enrollList',
            'badge':'fa fa-book',
            'submenu':None
            }
    return menu
# -----------------------------------------------------------------------
class enrollList(dashboardBody):
    template_name = 'enroll/dashboard_enrolled_list.html'

    def generate(self, request):
        enrollInst = enrolledProgram.objects.filter(user = request.user).exclude(status = Displayable.CONTENT_STATUS_INACTIVE)
        content = {'object_list': enrollInst}
        return self.render_content(request, content)
# -----------------------------------------------------------------------
