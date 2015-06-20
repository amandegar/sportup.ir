from django.views.generic import View, TemplateView
from django.utils.translation import ugettext_lazy as _
from django.template import Template, Context
from django.shortcuts import get_object_or_404
from django.contrib import messages
from django.core.urlresolvers import reverse
from django.http import HttpResponse, HttpResponseRedirect, Http404

from programcourse import models
#from programcourse import forms

#from agreement.models import agreement
from enrollment.models import clubItemEnrollment
from program.views import userAuthorizeMixin


# ----------------------------------------------------
class courseList(TemplateView):
    template_name= 'course/course_list.html'

# ----------------------------------------------------
class courseToggleStatus(userAuthorizeMixin, View):
    def get(self,request,*args,**kwargs):
        courseObject = models.courseDefinition.objects.get(pk = self.kwargs["courseId"])
        if self.kwargs["status"] == 'show':
            courseObject.status = 1
            courseObject.save()
        elif self.kwargs["status"] == 'hide':
            courseObject.status = 2
            courseObject.save()

        messages.info(request, _('The course status has been toggled.'))
        return HttpResponseRedirect(request.META['HTTP_REFERER'])

# ----------------------------------------------------
class courseAddCopy(userAuthorizeMixin, TemplateView):
    template_name = 'course/course_edit.html'

    def get(self,request,*args,**kwargs):
        context = self.get_context_data()
        context['next'] = request.META['HTTP_REFERER']
        context['agreementId'] = kwargs['agreementId']

        if 'courseId' in kwargs:
            courseDefInstance = models.courseDefinition.objects.get(pk = kwargs['courseId'])
            formCat = forms.courseCategoryForm({'category-title':courseDefInstance.clubItemCategoryKey},prefix='category')
            formDef = forms.courseDefinitionForm(instance=courseDefInstance,prefix='definition')
            #context['agreementId'] = courseDefInstance.agreementKey.id
        elif 'categoryTitle' in kwargs:
            formDef = forms.courseDefinitionForm(prefix='definition')
            formCat = forms.courseCategoryForm({'category-title':kwargs['categoryTitle']},prefix='category')
        else:
            formDef = forms.courseDefinitionForm(prefix='definition')
            formCat = forms.courseCategoryForm(prefix='category')

        context['formCat'] = formCat
        context['formDef'] = formDef
        context['formsetDay'] = forms.formsetFactDay(prefix='day')
        return self.render_to_response(context)

    def post(self,request,*args,**kwargs):
        context = self.get_context_data()

        formCat = forms.courseCategoryForm(self.request.POST,prefix='category')
        formDef = forms.courseDefinitionForm(self.request.POST,prefix='definition')

        formsetDay = forms.formsetFactDay(self.request.POST,prefix='day')

        agreementId = self.request.POST['agreementId']

        if  formCat.is_valid() and formDef.is_valid() and formsetDay.is_valid():
            #TODO: presave validation such date, end of agreement etc
            catId = formCat.save()

            defId = formDef.save(commit=False)
            defId.agreementKey = agreement.objects.get(pk = agreementId)
            defId.clubItemCategoryKey = catId
            defId.user = request.user
            defId.save()

            formsetDay.instance = defId
            formsetDay.save()

            messages.info(request, _("Your course has been created"))
            return HttpResponseRedirect(request.POST['next'])
        else:
            context['next'] = request.POST['next']
            context['formCat'] = formCat
            context['formDef'] = formDef
            context['formsetDay'] = formsetDay
            context['agreementId'] = agreementId

        return self.render_to_response(context)

# ----------------------------------------------------
class courseReserve(TemplateView):
    template_name = 'course/course_reserve.html'

    def get(self,request,*args,**kwargs):
        context = self.get_context_data()
        context['next'] = request.META['HTTP_REFERER']

        # Course validation
        courseInst = get_object_or_404(models.courseDefinition, pk = kwargs['courseId'])
        #models.courseDefinition.objects.select_related().get(pk = kwargs['courseId'])
        agreementInst = agreement.objects.published().filter( pk = courseInst.agreementKey_id)
        if not agreementInst:
            raise Http404

        # Multiple enrollment check
        enrollInst = clubItemEnrollment.objects.filter(clubItemDefinitionKey = kwargs['courseId']).filter(user_id = request.user.id)
        if enrollInst:
            messages.error(request, _("Attention! Previously you enrolled this course. Please check dashboard, enrollment section"))
            if not enrollInst[0].clubItemDefinitionKey.multipleReserve:
                return HttpResponseRedirect(request.META['HTTP_REFERER'])

        #TODO: Some pre registration check and course specification check
        ## Capacity check
        if courseInst.remainCapacity <= 0:
            messages.error(request, _("This course is full."))
            return HttpResponseRedirect(request.META['HTTP_REFERER'])

        ## Age check
        #if courseInst.ageMin > request.user.age or request.user.age > courseInst.ageMax:
        #    messages.error(request, _("Your age is out of acceptable range of this course"))
        #    return HttpResponseRedirect(request.META['HTTP_REFERER'])
        #
        ## Sex check
        #if courseInst.genderLimit != courseInst.GENDER_BOTH and request.user.sex != courseInst.genderLimit:
        #    messages.error(request, _("This course is unisex and it is not acceptable to enroll you"))
        #    return HttpResponseRedirect(request.META['HTTP_REFERER'])
        #
        ## insurance check
        #if courseInst.needInsurance and not request.user.insurance:
        #    messages.error(request, _("You need to have sport insurance. Please register your insurance number in your profile"))
        #    return HttpResponseRedirect(request.META['HTTP_REFERER'])

        context['course'] = courseInst

        return self.render_to_response(context)

    def post(self,request,*args,**kwargs):
        enrollInstance = clubItemEnrollment.objects.create(user_id = request.user.id,
                                                                 clubItemDefinitionKey_id=request.POST['courseId'],
                                                                 amount=int(request.POST['price']),
                                                                 status=clubItemEnrollment.ENROLLMENT_STATUS_RESERVED)
        messages.info(request, _("Your request added to your order and your place will reserve after successful online payment"))
        return HttpResponseRedirect(request.GET['next'])

# ----------------------------------------------------
class categorySearch(View):
    def get(self,request,*args,**kwargs):
        if 'title' in self.request.GET:
            t = Template('{% for item in object_list %} {{ item.title }} {% endfor %}')
            c = Context({'object_list':models.courseCategory.objects.filter(title__contains = self.request.GET['title'])})
            return HttpResponse(t.render(c))
        return HttpResponse('')
# ----------------------------------------------------