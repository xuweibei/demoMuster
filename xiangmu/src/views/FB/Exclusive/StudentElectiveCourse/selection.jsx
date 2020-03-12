import React from 'react';
import { bindActionCreators } from 'redux';
import {connect } from 'react-redux';
import { Form,Row,Col,Button,Select,Table,Modal,message } from 'antd';
const FormItem = Form.Item;
const confirm = Modal.confirm;
import ContentBox from '@/components/ContentBox';
import {searchFormItemLayout } from '@/utils/componentExt'; 
import { CourseSelectionList,CourseSelectionDropDown,ConfirmationOfCourseSelection } from '@/actions/stuService';
import View from './View'; 
//学生详情
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';

const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

class Selection extends React.Component{
    constructor(props){
        super(props);
        this.state = { 
            submit_list:[],
            CourseArr:[],
            dataModel:props.currentDataModel,
            editMode:props.editMode,
            UserSelecteds:[],
            CourseClass:[],
            loading:false,
            pagingSearch:{
                courseplanName:''
            }
        }
    }
    componentWillMount(){ 
        this.fetch2();
    }
    
    fetch = (courseCategoryId,isRehear) => {
        let condition = {};
        condition.courseCategoryId = courseCategoryId;
        condition.studentId = this.props.currentDataModel.studentId;
        condition.isRehear = isRehear; 
        condition.isHistory = 0; 
        let that = this; 
        return new Promise(function(resolve){ 
            that.props.CourseSelectionDropDown(condition).payload.promise.then((response) => {
                    let data = response.payload.data; 
                    if(data.state=='success'){
                        resolve(data.data) 
                        let { data_list } = that.state; 
                        that.setState({
                            data_list2:data_list
                        }) 
                    }else{
                        message.error(data.msg)
                    } 
            }
            )
        })
    } 
    fetch2 = (params = {} )=>{ 
        var condition = {};
        var that = this;
        condition.studentId = this.props.currentDataModel.studentId;
        condition.orderItmeIds = this.props.currentDataModel.orderItmeIds;
        this.setState({loading:true});
        this.props.CourseSelectionList(condition).payload.promise.then((response)=>{
            let data = response.payload.data;
            if(data.state == 'success'){ 
                let arr = [];
                data.data.forEach(item=>{
                    arr.push(that.fetch(item.courseCategoryId,item.isRehear))
                }) 
                //使用Promise的原因是，保证请求的时候的同步性，这样才能和每一条数据进行对应 
                Promise.all(arr).then(function(data){ 
                    let { CourseArr,data_list2 } = that.state;  
                    CourseArr = data;
                    //以下步骤是为了，如果某条数据有下拉，则给这条数据增加一个属性，用以是否可选择
                    let arr = []; 
                    if(data_list2){
                        data_list2.map((item,index)=>{
                            //判断下拉集合中是否有数据
                            if(CourseArr[index] && CourseArr[index].length ){
                                //将有数据的索引，存起来
                                arr.push(CourseArr.findIndex(item=>item == CourseArr[index]))
                            }
                        }) 
                        if(arr.length){
                            arr.map((item,index)=>{
                                //改变对应索引的数据，给起增加属性
                                data_list2[arr[index]]['down'] = 1;
                            })
                        } 
                    }
                   
                    that.setState({
                        CourseArr,
                        data_list2,
                        loading:false
                    }) 
                })
                this.setState({
                    pagingSearch: condition,
                    data_list: data.data,
                    totalRecord: data.totalRecord
                })
            }else{
                message.error(data.msg);
            }
        })
    }
    //table 输出列定义
    columns = [
      {
        title: '项目',
        width: 120,
        fixed: 'left',
        dataIndex: 'itemName'
      },
      {
        title: '科目',
        width: 100,
        dataIndex: 'courseCategoryName', 
      },
      {
        title: '授课方式',
        width: 100,
        dataIndex: 'teachModeName'
      },
      {
        title: '学习情况',
        width: 100,
        dataIndex: 'studyStatusName',
      },
      {
        title: '允许重修',
        width: 120,
        dataIndex: 'isRehearName',
      },
      {
        title: '是否重修',
        width: 100,
        dataIndex: 'isRestudyName', 
      },
      {
        title: '选择课程班',
        dataIndex: 'applicant', 
        render: (text, record, index) => {   
            if(this.state.CourseArr[index]){
                return <Select style={{width:"220px"}}
                  defaultValue={''}
                  onChange={(value) => this.onPayeeTypeChange(value, record.courseCategoryId)}
                >
                  <Select.Option value="">--请选择--</Select.Option>
                  {
                    this.state.CourseArr[index].map((item, index) => {
                      return <Select.Option value={item.courseArrangeId} key={index} title={item.courseplanFullName}>{item.courseplanFullName}</Select.Option>
                    })}
                </Select>
            } 
        }
      }, 
      {
        title: '操作',
        key: 'action',
        width: 120,
        fixed: 'right',
        render: (text, record) => {
          //编辑   适用商品 互斥设置(2)
          return <Button onClick={() => { this.onLookView('View', record); }}>查看</Button>  
        },
      }];
    onPayeeTypeChange(value, courseArrangeId) {  
        let arr = [];
        //获取所有数据的courseCategoryId
        this.state.data_list2.map(item=>{
            arr.push(item.courseCategoryId)
        });
        //找到选择下拉的id，判断他的索引
        let yy = arr.findIndex(item=>{
            return item == courseArrangeId
        })
        var list = this.state.submit_list; 
        let that = this;  
        if( list.length > 0 ){ 
            if(value){
                //通过传入的value，判断他所在的数据位置索引，然后和下拉选中数组里的数据进行比较，如果找到了，就将其删除；
                this.state.CourseArr[ChoiceId(value)].forEach((item,index)=>{  
                    list.forEach(kk=>{
                        if(item.courseArrangeId == kk){ 
                            list.splice(list.findIndex(jj=>kk==jj),1);  
                        } 
                    })
                })
                //然后这边添加最新的；这样就能保证，选的是哪个了，
                list.push(value)
            }else{
                //当选择下拉为空时，通过索引判断，是哪条数据为空的，然后将改索引下的所有数据都清空；就表示选择空了；
                this.state.CourseArr[yy].forEach((item,index)=>{  
                    list.forEach(kk=>{
                        if(item.courseArrangeId == kk){ 
                            list.splice(list.findIndex(jj=>kk==jj),1);  
                        } 
                    })
                })
            } 
        }else{
            list.push(value)
        }
        //获取传入的id的所在位置索引
        function ChoiceId(id){
            let info = '';
            let Indexes = '';
            let ones = '';
            that.state.CourseArr.forEach(item=>{ 
                if(item.length){ 
                    item.forEach(data=>{
                        if(data.courseArrangeId == id){
                            info = data;
                        }
                    }) 
                }
            }) 
            Indexes = that.state.CourseArr.findIndex(item=>{
                item.forEach(data=>{
                    if(data.courseArrangeId == info.courseArrangeId){
                        ones = data;
                    }
                })
                return ones
            })
            return Indexes ; 
        }  
        this.setState({
            submit_list:list
        })
    }
    onSubmit = (value) => { 
        let condition = {};
        condition.isHistory = 0;
        condition.courseArrangeIds = value.join(',');
        condition.studentId = this.state.dataModel.studentId; 
        this.props.ConfirmationOfCourseSelection(condition).payload.promise.then((response) => {
            let data = response.payload.data; 
            if(data.state=='success'){
                message.success('操作成功！')
                this.props.viewCallback(true);
            }else{
                message.error(data.msg)
            }
            }
        )  

    }
    onCancel = () => {
        this.props.viewCallback();
    }
    
    onLookView = (op,item) => {
        this.setState({
            editMode:op,
            currentDataModel: item
        })
    }
    renderBtnContorl(){
        return <FormItem
            className='btnControl'
            {...btnformItemLayout}
        >
            <Button type='primary' icon='save' loading={this.state.loading} onClick={this.onSubmit}>确定</Button><span className='split_button'></span><Button onClick = {this.onCancel} icon='rollback'>取消</Button>
        </FormItem>
    }
    //确定保存学生
    saveStudent = () => { 
        let that = this;
        if(!that.state.submit_list.length){
            message.warning('请选择对应课程班!')
        }else{
            let arr = [];
            //将所有的courseCategoryId获取到先，这是为了拿到选中的数据的索引
            this.state.data_list2.map(item=>{
                arr.push(item.courseCategoryId)
            });
            let primary = [];
            //拿到索引，放入数组
            this.state.selectDataList.forEach(data=>{
                primary.push(arr.findIndex(item=>{
                    return item == data.courseCategoryId
                }))
            }) 
            let Final = [];
            //循环一下，找出对应索引位置的CourseArr数据中，下拉选择的数据是否在里面。在里面就将其存到一个新数组中
            primary.map((item)=>{
                this.state.CourseArr[item].forEach(kkk=>{
                    this.state.submit_list.forEach(jjj=>{
                        if( jjj == kkk.courseArrangeId ){
                            Final.push(kkk.courseArrangeId)
                        }
                    })
                })
            }) 
            if( Final.length && Final.length == this.state.selectDataList.length ){
                confirm({
                        title: '您确定为此学生的选课设置吗？已保存的选课信息请通过“学生选课信息管理”功能进行调整！',
                        content: '',
                        onOk() { 
                                that.onSubmit(Final); 
                        },
                        onCancel() {
                            console.log('Cancel');
                        },
                        });
                
            } else{
                message.warning('请选择对应课程班!')
            }
        }
             
    }
    onViewCallback = (data) => {
        if(data){
            this.onSearch();
            this.setState({
                currentDataModel:null,
                editMode:'Selection',
                UserSelecteds:[],
                selectDataList:[],
                selectedRowKeys:[]
            })
        }else{
            this.setState({ currentDataModel:null,editMode:'Selection'})
        }
    }
    render(){      
        const { getFieldDecorator }  = this.props.form;
        let block_content = <div></div>; 
        const rowSelection = {
            onChange:(selectedRowKeys,selectedRows)=>{
                this.setState({
                    UserSelecteds:selectedRowKeys,
                    selectDataList:selectedRows,
                    selectedRowKeys
                })
            },
            getCheckboxProps: (record,index) => ({
                disabled: record.down ? false : true,
              }), 
            selectedRowKeys:this.state.UserSelecteds
        }
        switch(this.state.editMode){
            case 'ViewStudentDetail':
                block_content = <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.dataModel.studentId} />
              break;
            case 'Selection':
                block_content = (
                    <Form>
                        <Row gutter={24}>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label='学生姓名'
                                >
                                <div><a href="javascript:;" onClick={() => { this.onLookView('ViewStudentDetail'); }}>{this.state.dataModel.studentName}</a></div>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label='教学点'
                                >
                                <div>{this.state.dataModel.teachCenterName}</div>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label='证件号'
                                >
                                <div>{this.state.dataModel.certificateNo}</div>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label='手机号'
                                >
                                <div>{this.state.dataModel.mobile}</div>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label='微信号'
                                >
                                <div>{this.state.dataModel.weixin}</div>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label='QQ'
                                >
                                <div>{this.state.dataModel.qq}</div>
                                </FormItem>
                            </Col> 
                        </Row>
                    </Form>
                )
            break;
            case 'View':
                block_content = <View {...this.state}  viewCallback = {this.onViewCallback} />
            break;
        }
        
        return <div>
            {
                this.state.editMode == 'Selection'?<div>  
                    <ContentBox titleName={'学生选课修改'}>
                        <div className='dv_split'></div>
                        {block_content}
                        {/* <div className='dv_split'></div> */}
                    </ContentBox>
                    <div className='space-default'></div>
                    <div calssName='search-result-list'> 
                        <Table 
                            columns = { this.columns }
                            loading = { this.state.loading }
                            pagination = { false }
                            dataSource = { this.state.data_list2 }
                            bordered
                            rowKey = { record => record.studentPayfeeId }
                            scroll = {{ x:1000 }}
                            rowClassName = { record => record.zbPayeeTypeIsEquals == false?'hightLight_column':''}
                            rowSelection = { rowSelection }
                        />
                        <div className='space-default'></div>
                        <div className='search-paging'>
                            <Row justify='space-between' align='middle' type='flex'>
                                <Col span={24}>
                                    {
                                        this.state.UserSelecteds.length ? 
                                        <Button onClick = {this.saveStudent} icon='save'>确定</Button>
                                        : 
                                        <Button disabled icon='save'>确定</Button>
                                    }
                                    <div className='split_button' style={{ width: 10 }}></div>
                                    <Button icon='rollback' onClick = {this.onCancel}>返回</Button>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>:<div>{block_content}</div>
            }
        </div>
    }

}


const WrappedMange = Form.create()(Selection);

const mapStateTopProps = (state) => {
    let { Dictionarys } = state.dic;
    return { Dictionarys };
}
function mapDispatchTopProps(dispatch){
    return {
        CourseSelectionDropDown: bindActionCreators(CourseSelectionDropDown, dispatch),
        CourseSelectionList: bindActionCreators(CourseSelectionList, dispatch),
        ConfirmationOfCourseSelection: bindActionCreators(ConfirmationOfCourseSelection, dispatch),
    }
}

export default connect(mapStateTopProps,mapDispatchTopProps)(WrappedMange)