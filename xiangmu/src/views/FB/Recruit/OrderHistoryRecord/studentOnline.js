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
      that.setState({ loading: true });

      if(this.props.studentId){
        values.regSource = values.regSource || this.state.dataModel.regSource;
        values.regRegionId = values.regRegionId || this.state.dataModel.regRegionId;
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
          list = []

          break;

        case 'CreateByOrderCreate':
        case 'EditClassDirection':
        case 'EditClassAmateur':
        case 'EditPerson':
        case 'CreateStudentOnline':
        case 'EditPersonOnline':
          //订单创建 》 新增/修改学生
          list = [
            {type: 'text'   , title: '学生信息', className: 'formTitle'                     , span: 24},
            {type: 'input'  , title: '学生姓名', name: 'realName'        , required: true, value: this.state.dataModel.realName},
            {type: 'input', title: '手机', name: 'mobile', required: true, value: this.state.dataModel.mobile, validator: 'mobile'},
            {type: 'input', title: '电子邮箱', name: 'email', required: false, value: this.state.dataModel.email, validator: 'email'},
            {type: 'radio'  , title: '性　　别', name: 'gender', data: 'sex', required: false, value: this.state.dataModel.gender},
            {type: 'select' , title: '证件类型', name: 'certificateType', data: 'certificate_type', required: false, value: this.state.dataModel.certificateType},
            {type: 'input'  , title: '证件号码', name: 'certificateNo'                            , required: false, value: this.state.dataModel.certificateNo, need_callback:true},
            {type: 'date'   , title: '出生日期', name: 'birth'                                    , required: false, value: this.state.dataModel.birth},
            {type: 'select' , title: '民族', name: 'nationId'       , data: 'nation'          , required: false, value: this.state.dataModel.nationId},

          ]
          if(this.props.editMode == 'CreateByOrderCreate'){
            
          }else {
            
          }
          break;
      }
      if(this.state.dataModel.isStudy == "0"){
        var list_work = [];
        list_work.map(l => {
          list.push(l)
        });
      }
      if(this.state.dataModel.isStudy == "1"){
        var list_study = [];
        list_study.map(l => {
          list.push(l)
        });
      }

      if(this.props.editMode == 'CreateByStudentManage' || this.props.editMode == 'EditByStudentManage' || this.props.editMode=='CreateStudentOnline'){
        //学生管理 》 新增/修改学生
        list.push( {type: 'input', title: '学生备注', name: 'otherMark', rows: 4, value: this.state.dataModel.otherMark} );

        btn_list.push({title: '保存', loading: this.state.loading, callback: this.onSubmit});
      }
      if(this.props.editMode == 'CreateByOrderCreate'
        || this.props.editMode == 'EditClassDirection'
        || this.props.editMode == 'EditClassAmateur'
        || this.props.editMode == 'EditPerson'
        || this.props.editMode == 'EditPersonOnline'
      ){
        //订单创建 》 新增/修改学生
        
        if(this.props.editMode == 'EditClassDirection'
          || this.props.editMode == 'EditClassAmateur'
          || this.props.editMode == 'EditPerson'
          || this.props.editMode == 'EditPersonOnline'){

          if(this.props.editMode == 'EditClassDirection'){
            btn_list.push({title: '保存&下一步>>方向班订单', loading: this.state.loading, callback: this.onSubmit});
            // btn_list.push({title: '下一步>>方向班订单', callback: this.onNext});
          }else if(this.props.editMode == 'EditClassAmateur'){
            btn_list.push({title: '保存&下一步>>业余班订单', loading: this.state.loading, callback: this.onSubmit});
            // btn_list.push({title: '下一步>>业余班订单', callback: this.onNext});
          }else if(this.props.editMode == 'EditPerson' || this.props.editMode == 'EditPersonOnline'){
            btn_list.push({title: '保存&下一步>>个人订单', loading: this.state.loading, callback: this.onSubmit});
            // btn_list.push({title: '下一步>>个人订单', callback: this.onNext});
          }
        }else {
          btn_list.push({title: '保存', loading: this.state.loading, callback: this.onSubmit});
        }
      }

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
          form_item_list={list}
          extendButtons={btn_list}
          onCancel={this.onCancel}
          //title={"创建订单 第一步：学生基本信息确定及修改"}
          title={this.props.editMode == "CreateByOrderCreate" || this.props.editMode == "CreateByStudentManage" ||  this.props.editMode == "CreateStudentOnline" ? "新增学生" : this.props.editMode == "EditByStudentManage" ? "修改学生" : "创建订单 第一步：学生基本信息确定及修改"}
          onCallback={(value, name) => {
            var d = that.state.dataModel;
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
