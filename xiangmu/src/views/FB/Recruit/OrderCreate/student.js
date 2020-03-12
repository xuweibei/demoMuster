/*
学生 新增/编辑  （ 学生管理 / 订单新增 ）
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Button, Icon, DatePicker,
  Checkbox, message, Table, Select, Radio } from 'antd';
import moment from 'moment';
import ContentBox from '@/components/ContentBox';
const FormItem = Form.Item;
const { TextArea } = Input;
import NumericInput from '@/components/NumericInput';
import EditForm from '@/components/EditForm';

const btnformItemLayout = {
    wrapperCol: { span: 24 },
};


const dateFormat = 'YYYY-MM-DD';
import { getViewEditModeTitle, dataBind, timestampToTime, formatMoment } from '@/utils';
import { loadBizDictionary } from '@/utils/componentExt';
import { studentById, studentCheck } from '@/actions/recruit';
import { loadDictionary } from '@/actions/dic';

class StudentEdit extends React.Component {
    constructor(props) {
      super(props)
      var _m = props.currentDataModel || {};
      _m.isStudy = _m.isStudy || "0";   //1 在读； 0 在职
      this.state = {
          dataModel: _m,//数据模型
          endOpen: false,
          dic_item_list: [],
          //studentId: props.studentId
      };
      (this: any).onSubmit = this.onSubmit.bind(this);
      this.loadBizDictionary = loadBizDictionary.bind(this);
      (this: any).fetchStudentById = this.fetchStudentById.bind(this);
      (this: any).checkStudentExist = this.checkStudentExist.bind(this);
    }

    componentWillMount() {
      this.loadBizDictionary(['teach_way', 'dic_sex', 'is_study', 'reg_source']);
      this.fetchStudentById();

      console.log("editMode=" + this.props.editMode);
    }
    componentWillReceiveProps(nextProps) {
        if ('submitLoading' in nextProps) {
          this.setState({
            loading: nextProps.submitLoading,
          });
        }
    }
    fetchStudentById(){
      if(this.props.studentId){
        this.props.studentById(this.props.studentId).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
              this.setState({
                dataModel: data.data
              });
            }
            else {
                message.error(data.message);
            }
        })
      }
    }
    checkStudentExist(info, callback){
      this.props.studentCheck(info).payload.promise.then((response) => {
          let data = response.payload.data;
          this.props.setSubmitLoading(false);
          if (data.state === 'success') {
            if(callback){
              this.props.setSubmitLoading(true);
              callback();
            }
          }
          else {
              message.error(data.message);
          }
      })
    }

    onCancel = () => {
      this.props.viewCallback();
    }
    onNext = () => {
      if(this.props.editMode.indexOf("Edit") == 0){
        var editMode = this.props.editMode.replace("Edit", "Order");
        this.props.onNextView(editMode, this.state.dataModel);
      }else {
        message.error("不能下一步");
      }
    }
    onSubmit = (values) => {
      var that = this;

      if(this.props.studentId){
        values.regSource = values.regSource || this.state.dataModel.regSource;
        values.regRegionId = values.regRegionId || this.state.dataModel.regRegionId;
        values.subRegSource = values.subRegSource || this.state.dataModel.subRegSource;
      }
      if(values.certificateNo && !values.certificateType){
        message.error("请选择一个证件类型！");
        return;
      }
      if(!values.certificateNo && !values.mobile && !values.weixin && !values.qq){
        message.error("请至少输入一个联系方式！");
        return;
      }

      this.props.setSubmitLoading(true);

      values.birth = formatMoment(values.birth);
      var params = {
        userId: this.props.studentId,
        certificateNo: values.certificateNo,
        certificateType: values.certificateType,
        mobile: values.mobile,
        weixin: values.weixin,
        qq: values.qq
      };
      this.checkStudentExist(params, function(){
        that.props.viewCallback({ ...values, studentId: that.props.studentId });
      })
    }
    render() {
      var that = this;
      var regSourceName = '';
      if(this.state.reg_source && this.state.dataModel.regSource){
        this.state.reg_source.map(i => {
          if(this.state.dataModel.regSource == i.value){
            regSourceName = i.title;
          }
        })
      }

      //数据
      var list = [];
      //底部按钮
      var btn_list = [];

      var isRequired = true;
      switch(this.props.editMode){
        case 'CreateByStudentManage':
        case 'EditByStudentManage':
          //学生管理 》 新增/修改学生
          isRequired = false;
          list = [
            {type: 'select' , title: '学生来源', name: 'regSource'      , data: 'reg_source'      , required: true, value: [this.state.dataModel.regSource,this.state.dataModel.subRegSource], need_callback:true},
            {type: 'select' , title: '所属区域', name: 'regRegionId'    , data: 'region'            , required: true, value: this.state.dataModel.regRegionId, need_callback:true},
            {type: 'input'  , title: '学生姓名', name: 'realName'        , required: true, value: this.state.dataModel.realName},
            {type: 'radio'  , title: '性　　别', name: 'gender', data: 'sex', required: false, value: this.state.dataModel.gender},
            {type: 'select' , title: '证件类型', name: 'certificateType', data: 'certificate_type', required: false, value: this.state.dataModel.certificateType},
            {type: 'input'  , title: '证件号码', name: 'certificateNo'                            , required: false, value: this.state.dataModel.certificateNo, need_callback:true},
            {type: 'input', title: '手机', name: 'mobile', required: false, value: this.state.dataModel.mobile, validator: 'mobile'},
            {type: 'input', title: '微信'   , name: 'weixin', required: false, value: this.state.dataModel.weixin},
            {type: 'input', title: 'QQ'     , name: 'qq', required: false, value: this.state.dataModel.qq},
            {type: 'input', title: '电子邮箱', name: 'email', value: this.state.dataModel.email, validator: 'email'},
            
            { type: 'select', title: '教学点', name: 'teachCenterId', data: 'teach_center', required: false, value: this.state.dataModel.teachCenterId },
            
            {type: 'date'   , title: '出生日期', name: 'birth'                                    , required: false, value: this.state.dataModel.birth},
            {type: 'select' , title: '民族', name: 'nationId'       , data: 'nation'          , required: false, value: this.state.dataModel.nationId},
            {type: 'radio'  , title: '目前是否在读', name: 'isStudy'    , data: 'is_study'       , required: false, value: this.state.dataModel.isStudy, need_callback:true},
            {type: 'select' , title: '当前学历', name: 'educationId'      , data: 'education'       , required: false, value: this.state.dataModel.educationId},
          ]

          break;

        case 'CreateByOrderCreate':
        case 'EditClassDirection':
        case 'EditClassAmateur':
        case 'EditPerson':
          //订单创建 》 新增/修改学生
          list = [
            {type: 'text'   , title: '学生关键信息', className: 'formTitle'                     , span: 24},
            {type: 'input'  , title: '学生姓名', name: 'realName'        , required: true, value: this.state.dataModel.realName},
            {type: 'radio'  , title: '性　　别', name: 'gender', data: 'sex', required: true, value: this.state.dataModel.gender},
            {type: 'select' , title: '证件类型', name: 'certificateType', data: 'certificate_type', required: true, value: this.state.dataModel.certificateType},
            {type: 'input'  , title: '证件号码', name: 'certificateNo'                            , required: true, value: this.state.dataModel.certificateNo, need_callback:true},
            {type: 'date'   , title: '出生日期', name: 'birth'                                    , required: true, value: this.state.dataModel.birth},
            {type: 'select' , title: '民族', name: 'nationId'       , data: 'nation'          , required: true, value: this.state.dataModel.nationId},

            {type: 'text'   , title: '学生目前情况', className: 'formTitle'                     , span: 24},
          ]
          if(this.props.editMode == 'CreateByOrderCreate'){
            list.push({type: 'select' , title: '学生来源', name: 'regSource'      , data: 'reg_source'      , required: true, value: [this.state.dataModel.regSource,this.state.dataModel.subRegSource], need_callback:true});
            list.push({type: 'select' , title: '所属区域', name: 'regRegionId'    , data: 'region'            , required: true, value: this.state.dataModel.regRegionId, need_callback:true});
            list.push({type: 'radio'  , title: '目前是否在读', name: 'isStudy'    , data: 'is_study'       , required: true, value: this.state.dataModel.isStudy, need_callback:true});
            list.push({type: 'select' , title: '当前学历', name: 'educationId'      , data: 'education'       , required: true, value: this.state.dataModel.educationId});
          }else {
            list.push({type: 'radio'  , title: '目前是否在读', name: 'isStudy'    , data: 'is_study'       , required: true, value: this.state.dataModel.isStudy, need_callback:true});
            list.push({type: 'select' , title: '当前学历', name: 'educationId'      , data: 'education'       , required: true, value: this.state.dataModel.educationId});
          }
          break;
      }
      if(this.state.dataModel.isStudy == "0"){
        var list_work = [
          //{type: 'search_input', title: '本科或专科毕业院校', name: 'graduateUniversityId', data: 'university', required: true, value: this.state.dataModel.graduateUniversityId, value2: this.state.dataModel.graduateUniversityName},
          {type: 'university', title: '本科或专科毕业院校', name: 'graduateUniversityId', data: 'university', required: isRequired, value: this.state.dataModel.graduateUniversityId, value2: this.state.dataModel.graduateUniversityName},
          //{type: 'input'  , title: '本科入学年份', name: 'ccccccccccc'                 , required: true},
          {type: 'input'  , title: '本科毕业年份', name: 'universityGraduateYear'                   , required: isRequired, value: this.state.dataModel.universityGraduateYear, validator: 'year'},
          {type: 'areas', title: '高中毕业院校省市', name: 'highSchoolAreaId', required: false, value: this.state.dataModel.highSchoolAreaId, value2: this.state.dataModel.highSchoolAreaName},
          {type: 'input', title: '高中毕业院校名', name: 'highSchool', required: false, value: this.state.dataModel.highSchool},
          //{type: 'input', title: '高中入学年份', name: 'aaaaaaaaaaaa', required: true},
          {type: 'input', title: '高中毕业年份', name: 'highSchoolGraduateYear', required: false, value: this.state.dataModel.highSchoolGraduateYear, validator: 'year'},
          {type: 'input', title: '在职单位', name: 'workCompany', value: this.state.dataModel.workCompany},
          {type: 'input', title: '职位', name: 'workJob', value: this.state.dataModel.workJob},
          {type: 'date', title: '入职日期', name: 'workDate', value: this.state.dataModel.workDate},
        ];
        list_work.map(l => {
          list.push(l)
        });
      }
      if(this.state.dataModel.isStudy == "1"){
        var list_study = [
          //{type: 'search_input', title: '在读院校', name: 'studyUniversityId', data: 'university', required: true, value: this.state.dataModel.studyUniversityId, value2: this.state.dataModel.studyUniversityName},
          {type: 'university', title: '在读院校', name: 'studyUniversityId', data: 'university', required: true, value: this.state.dataModel.studyUniversityId, value2: this.state.dataModel.studyUniversityName},
          //和杨老师确认，校区改成非必填的了 2018-07-12
          {type: 'select', title: '在读院校/校区', name: 'studyCampusId', data: 'campus', required: true, value: this.state.dataModel.studyCampusId, value2: this.state.dataModel.studyCampusName},
          {type: 'input', title: '院系', name: 'studyDepartment', required: isRequired, value: this.state.dataModel.studyDepartment},
          {type: 'input', title: '专业', name: 'studySpecialty', required: isRequired, value: this.state.dataModel.studySpecialty},
          {type: 'input', title: '入学年份', name: 'studyUniversityEnterYear', required: isRequired, value: this.state.dataModel.studyUniversityEnterYear, validator: 'year'},
        ];
        list_study.map(l => {
          list.push(l)
        });
      }

      if(this.props.editMode == 'CreateByStudentManage' || this.props.editMode == 'EditByStudentManage'){
        //学生管理 》 新增/修改学生
        list.push( {type: 'input', title: '紧急联系人姓名', name: 'emergencyContactName', value: this.state.dataModel.emergencyContactName} );
        list.push( {type: 'input', title: '紧急联系人电话', name: 'emergencyContactPhone', value: this.state.dataModel.emergencyContactPhone} );
        list.push( {type: 'input', title: '通讯地址', name: 'address', value: this.state.dataModel.address} );
        if(this.state.dataModel.regSource == 3){
          //来源是校园代理时，可设置市场人员
          list.push({type: 'select', title: '市场人员用户名', name: 'benefitMarketUserId', data: 'area_user', required: false, value: this.state.dataModel.benefitMarketUserName, value2: this.state.dataModel.regRegionId})
        }
        list.push({type: 'select', title: '学生意向等级', name: 'grade', data: 'grade', required: false, value: this.state.dataModel.grade})
        list.push( {type: 'checkbox', title: '了解中博教育的方式', name: 'gainWayIds', data: 'gain_way', value: this.state.dataModel.ganWaysIds} );
        list.push( {type: 'input', title: '学生备注', name: 'otherMark', rows: 4, value: this.state.dataModel.otherMark} );
        list.push( {type: 'input', title: '名片词', name: 'bcWord', rows: 4, value: this.state.dataModel.bcWord} );

        btn_list.push({title: '保存',loading: this.state.loading, callback: this.onSubmit});
      }
      if(this.props.editMode == 'CreateByOrderCreate'
        || this.props.editMode == 'EditClassDirection'
        || this.props.editMode == 'EditClassAmateur'
        || this.props.editMode == 'EditPerson'
      ){
        //订单创建 》 新增/修改学生
        list.push( {type: 'checkbox', title: '了解中博教育的方式', name: 'gainWayIds', data: 'gain_way', value: this.state.dataModel.ganWaysIds} );
        list.push( {type: 'input', title: '学生备注', name: 'otherMark', rows: 4, value: this.state.dataModel.otherMark} );

        var _list = [
          {type: 'text' , title: '学生联系方式', className: 'formTitle', span: 24},
          {type: 'input', title: '手机', name: 'mobile', required: true, value: this.state.dataModel.mobile, validator: 'mobile'},
          {type: 'input', title: '电子邮箱', name: 'email', required: true, value: this.state.dataModel.email, validator: 'email'},
          {type: 'input', title: 'QQ'     , name: 'qq', required: true, value: this.state.dataModel.qq},
          {type: 'input', title: '微信'   , name: 'weixin', required: true, value: this.state.dataModel.weixin},
          {type: 'input', title: '紧急联系人姓名', name: 'emergencyContactName', required: true, value: this.state.dataModel.emergencyContactName},
          {type: 'input', title: '紧急联系人电话', name: 'emergencyContactPhone', required: true, value: this.state.dataModel.emergencyContactPhone},
          {type: 'select', title: '与紧急联系人关系', name: 'emergencyContactType', data: 'contact_type', required: true, value: this.state.dataModel.emergencyContactType},
          {type: 'input', title: '通讯地址', name: 'address', value: this.state.dataModel.address},
        ];
        _list.map(l => {
          list.push(l)
        });
        if(this.props.editMode == 'EditClassDirection'
          || this.props.editMode == 'EditClassAmateur'
          || this.props.editMode == 'EditPerson'){
          list.push({type: 'text', title: '学生相关管理信息', className: 'formTitle', span: 24})
          list.push({type: 'text', title: '学生来源', value: regSourceName})
          list.push({type: ''});
          list.push({type: 'text', title: '所属分部', value: this.state.dataModel.branchName})
          list.push({type: 'text', title: '所属区域', value: this.state.dataModel.regRegionName})
          list.push({type: 'text', title: '市场人员', value: this.state.dataModel.benefitMarketUserName})
          list.push({type: 'text', title: '咨询人员', value: this.state.dataModel.benefitPconsultUserName || this.state.dataModel.benefitFconsultUserName})

          if(this.props.editMode == 'EditClassDirection'){
            btn_list.push({title: '保存&下一步>>方向班订单',loading: this.state.loading, callback: this.onSubmit});
            // btn_list.push({title: '下一步>>方向班订单', callback: this.onNext});
          }else if(this.props.editMode == 'EditClassAmateur'){
            btn_list.push({title: '保存&下一步>>业余班订单',loading: this.state.loading, callback: this.onSubmit});
            // btn_list.push({title: '下一步>>业余班订单', callback: this.onNext});
          }else if(this.props.editMode == 'EditPerson'){
            btn_list.push({title: '保存&下一步>>个人订单',loading: this.state.loading, callback: this.onSubmit});
            // btn_list.push({title: '下一步>>个人订单', callback: this.onNext});
          }
        }else {
          btn_list.push({title: '保存', loading: this.state.loading, callback: this.onSubmit});
        }
      }

      /*var list = [
        {type: 'text'   , title: '学生关键信息', className: 'formTitle'                     , span: 24},
        {type: 'input'  , title: '学生姓名', name: 'realName'        , required: true, value: this.state.dataModel.realName},
        {type: 'radio'  , title: '性　　别', name: 'gender', data: 'sex', required: true, value: this.state.dataModel.gender},
        {type: 'select' , title: '证件类型', name: 'certificateType', data: 'certificate_type', required: false, value: this.state.dataModel.certificateType},
        {type: 'input'  , title: '证件号码', name: 'certificateNo'                            , required: false, value: this.state.dataModel.certificateNo, need_callback:true},
        {type: 'date'   , title: '出生日期', name: 'birth'                                    , required: true, value: this.state.dataModel.birth},
        {type: 'select' , title: '民　　族', name: 'nationId'       , data: 'nation'          , required: true, value: this.state.dataModel.nationId},
        {type: 'text'   , title: '学生目前情况', className: 'formTitle'                     , span: 24},
      ];
      //底部按钮
      var btn_list = [];
      if(this.props.editMode == 'Create' || this.props.editMode == 'Edit'){
        list.push({type: 'select' , title: '学生来源', name: 'regSource'      , data: 'reg_source'      , required: true, value: this.state.dataModel.regSource, need_callback:true});
        list.push({type: 'select' , title: '所属区域', name: 'regRegionId'    , data: 'region'            , required: true, value: this.state.dataModel.regRegionId, need_callback:true});

        btn_list.push({title: '保存', callback: this.onSubmit});
      }
      list.push({type: 'radio'  , title: '目前是否在读', name: 'isStudy'    , data: 'is_study'       , required: true, value: this.state.dataModel.isStudy, need_callback:true});
      list.push({type: 'select' , title: '当前学历', name: 'educationId'      , data: 'education'       , required: true, value: this.state.dataModel.educationId});
      if(this.state.dataModel.isStudy == "0"){
        var list_work = [
          {type: 'search_input', title: '本科或专科毕业院校', name: 'graduateUniversityId', data: 'university', required: true, value: this.state.dataModel.graduateUniversityId, value2: this.state.dataModel.graduateUniversityName},
          //{type: 'input'  , title: '本科入学年份', name: 'ccccccccccc'                 , required: true},
          {type: 'input'  , title: '本科毕业年份', name: 'universityGraduateYear'                   , required: true, value: this.state.dataModel.universityGraduateYear, validator: 'year'},
          {type: 'areas', title: '高中毕业院校省市', name: 'highSchoolAreaId', required: true, value: this.state.dataModel.highSchoolAreaId, value2: this.state.dataModel.highSchoolAreaName},
          {type: 'input', title: '高中毕业院校名', name: 'highSchool', required: true, value: this.state.dataModel.highSchool},
          //{type: 'input', title: '高中入学年份', name: 'aaaaaaaaaaaa', required: true},
          {type: 'input', title: '高中毕业年份', name: 'highSchoolGraduateYear', required: true, value: this.state.dataModel.highSchoolGraduateYear, validator: 'year'},
          {type: 'input', title: '在职单位', name: 'workCompany', value: this.state.dataModel.workCompany},
          {type: 'input', title: '职位', name: 'workJob', value: this.state.dataModel.workJob},
          {type: 'date', title: '入职日期', name: 'workDate', value: this.state.dataModel.workDate},
        ];
        list_work.map(l => {
          list.push(l)
        });
      }

      if(this.state.dataModel.isStudy == "1"){
        var list_study = [
          {type: 'search_input', title: '在读院校', name: 'studyUniversityId', data: 'university', required: true, value: this.state.dataModel.studyUniversityId, value2: this.state.dataModel.studyUniversityName},
          {type: 'select', title: '在读院校/校区', name: 'studyCampusId', data: 'campus', required: true, value: this.state.dataModel.studyCampusId, value2: this.state.dataModel.studyCampusName},
          {type: 'input', title: '院系', name: 'studyDepartment', required: true, value: this.state.dataModel.studyDepartment},
          {type: 'input', title: '专业', name: 'studySpecialty', required: true, value: this.state.dataModel.studySpecialty},
          {type: 'input', title: '入学年份', name: 'studyUniversityEnterYear', required: true, value: this.state.dataModel.studyUniversityEnterYear, validator: 'year'},
          {type: 'text', title: '　　'}
        ];
        list_study.map(l => {
          list.push(l)
        });
      }
      var list4 = [
        {type: 'checkbox', title: '了解中博教育的方式', name: 'gainWayIds', data: 'gain_way', value: this.state.dataModel.ganWaysIds},
        {type: 'input', title: '学生备注', name: 'otherMark', rows: 4, value: this.state.dataModel.otherMark},
        {type: 'text' , title: '学生联系方式', className: 'formTitle', span: 24},
        {type: 'input', title: '手机', name: 'mobile', required: false, value: this.state.dataModel.mobile},
        {type: 'input', title: '微信'   , name: 'weixin', required: false, value: this.state.dataModel.weixin},
        {type: 'input', title: 'QQ'     , name: 'qq', required: false, value: this.state.dataModel.qq},
        {type: 'input', title: '电子邮箱', name: 'email', value: this.state.dataModel.email},
        {type: 'input', title: '紧急联系人姓名', name: 'emergencyContactName', required: true, value: this.state.dataModel.emergencyContactName},
        {type: 'input', title: '紧急联系人电话', name: 'emergencyContactPhone', required: true, value: this.state.dataModel.emergencyContactPhone},
        {type: 'select', title: '与紧急联系人关系', name: 'emergencyContactType', data: 'contact_type', required: true, value: this.state.dataModel.emergencyContactType},
        {type: 'input', title: '通讯地址', name: 'address', value: this.state.dataModel.address},
      ];
      list4.map(l => {
        list.push(l)
      });
      if(this.props.editMode == 'EditClassDirection'
        || this.props.editMode == 'EditClassAmateur'
        || this.props.editMode == 'EditPerson'){
        list.push({type: 'text', title: '学生相关管理信息', className: 'formTitle', span: 24})
        list.push({type: 'text', title: '学生来源', value: regSourceName})
        list.push({type: ''});
        list.push({type: 'text', title: '所属分部', value: this.state.dataModel.branchName})
        list.push({type: 'text', title: '所属区域', value: this.state.dataModel.regRegionName})
        list.push({type: 'text', title: '市场人员', value: this.state.dataModel.benefitMarketUserName})
        list.push({type: 'text', title: '咨询人员', value: this.state.dataModel.benefitPconsultUserName || this.state.dataModel.benefitFconsultUserName})

        if(this.props.editMode == 'EditClassDirection'){
          btn_list.push({title: '保存&下一步>>方向班订单', callback: this.onSubmit});
          btn_list.push({title: '下一步>>方向班订单', callback: this.onNext});
        }else if(this.props.editMode == 'EditClassAmateur'){
          btn_list.push({title: '保存&下一步>>业余班订单', callback: this.onSubmit});
          btn_list.push({title: '下一步>>业余班订单', callback: this.onNext});
        }else if(this.props.editMode == 'EditPerson'){
          btn_list.push({title: '保存&下一步>>个人订单', callback: this.onSubmit});
          btn_list.push({title: '下一步>>个人订单', callback: this.onNext});
        }
      }else {
        if(this.state.dataModel.regSource == 3){
          //来源是校园代理时，可设置市场人员
          list.push({type: 'select', title: '市场人员用户名', name: 'benefitMarketUserId', data: 'area_user', required: false, value: this.state.dataModel.benefitMarketUserName, value2: this.state.dataModel.regRegionId})
        }
      }
      //btn_list.push({title: '返回', callback: this.onCancel})
      */

      return (
        <EditForm
          isSex={true}
          isCertificateType={true}
          isNation={true}
          isRegSource={true}
          isStudy={true}
          isEducation={true}
          isGrade={true}
          isUniversity={true}
          isCampus={this.state.dataModel.isStudy == "1" ? true : false}
          //isCampus={true}
          isContactType={true}
          //isRegion={this.props.editMode == "Create" ? true : false}
          isRegion={true}
          isAreaUser={true}
          isTeachCenter={true}
          form_item_list={list}
          extendButtons={btn_list}
          onCancel={this.onCancel}
          //title={"创建订单 第一步：学生基本信息确定及修改"}
          title={this.props.editMode == "CreateByOrderCreate" || this.props.editMode == "CreateByStudentManage" ? "新增学生" : this.props.editMode == "EditByStudentManage" ? "修改学生" : "创建订单 第一步：学生基本信息确定及修改"}
          onCallback={(value, name) => {
            var d = that.state.dataModel;
            console.log(d)
            if(name == "certificateNo"){
              if(value && value.length == 18){
                var _date = value.substr(6, 4) + "-" + value.substr(10, 2) + "-" + value.substr(12, 2);
                d.birth = _date;
              }
            }else if(name == "regSource"){
              d.regSource = value;
            }else if(name == "regRegionId"){
              d.regRegionId = value;
            }
            else {
              d.isStudy = value;
            }
            this.setState({dataModel: d});
          }}
        />
      );
    }
}

const WrappedView = Form.create()(StudentEdit);

const mapStateToProps = (state) => {
    let { Dictionarys } = state.dic;
    return {
        Dictionarys,
        menus: state.menu.items
    }
};

function mapDispatchToProps(dispatch) {
    return {
      loadDictionary: bindActionCreators(loadDictionary, dispatch),
      studentById: bindActionCreators(studentById, dispatch),
      //getItemList: bindActionCreators(getItemList, dispatch),
      studentCheck: bindActionCreators(studentCheck, dispatch)
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
