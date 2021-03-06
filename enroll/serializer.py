from rest_framework import serializers
from models import enrolledProgramSession,enrolledProgramCourse,enrolledProgram

# ----------------------------------------------------
class enrollProgramCourseSerializer(serializers.ModelSerializer):
    firstname = serializers.ReadOnlyField(source='user.first_name')
    lastname  = serializers.ReadOnlyField(source='user.last_name')
    userId  = serializers.ReadOnlyField(source='user.id')
    class Meta:
        model = enrolledProgramCourse
# ----------------------------------------------------
class enrollProgramSessionSerializer(serializers.ModelSerializer):
    firstname = serializers.ReadOnlyField(source='user.first_name')
    lastname  = serializers.ReadOnlyField(source='user.last_name')
    userId  = serializers.ReadOnlyField(source='user.id')
    class Meta:
        model = enrolledProgramSession
# ----------------------------------------------------
class enrollProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = enrolledProgram

    def to_representation(self, obj):
        """
        Because enrollProgram is Polymorphic
        """
        if isinstance(obj, enrolledProgramCourse):
            return enrollProgramCourseSerializer(obj, context=self.context).to_representation(obj)
        elif isinstance(obj, enrolledProgramSession):
           return enrollProgramSessionSerializer(obj, context=self.context).to_representation(obj)
        return super(enrollProgramSerializer, self).to_representation(obj)
# ----------------------------------------------------
class enrollSessionSerializer(serializers.Serializer):
    club    = serializers.IntegerField()
    week    = serializers.IntegerField()
    cellid  = serializers.IntegerField()
# ----------------------------------------------------
class enrollSessionClubSerializer(enrollSessionSerializer):
    firstName=serializers.CharField(max_length=20)
    lastName =serializers.CharField(max_length=20)
    eMail    =serializers.EmailField(required=False)
    cellPhone=serializers.CharField(max_length=15, required=False)

# ----------------------------------------------------
#class enrollCourseClubSerializer (serializers.Serializer):
class enrollCourseSerializer(serializers.Serializer):
    courseId    = serializers.IntegerField()
# ----------------------------------------------------
class enrollCourseClubSerializer(enrollCourseSerializer):
    firstName=serializers.CharField(max_length=20)
    lastName =serializers.CharField(max_length=20)
    eMail    =serializers.EmailField(required=False)
    cellPhone=serializers.CharField(max_length=15, required=False)
