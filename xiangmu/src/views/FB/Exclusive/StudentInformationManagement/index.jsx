

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'
import { Form,Row,Col,Select,Input,DatePicker,Table,Pagination,Button,message } from 'antd';
const FormItem = Form.Item; 
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';
import moment from 'moment';
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
import ContentBox from '@/components/ContentBox';
import { dataBind,timestampToTime,formatMoment,getDictionaryTitle } from '@/utils';
import { searchFormItemLayout,renderSearchTopButtons,renderSearchBottomButtons,onSearch,onToggleSearchOption,onPageIndexChange, onShowSizeChange,loadBizDictionary } from '@/utils/componentExt';
import SelectTeachCenterByUser from '@/components/BizSelect/SelectTeachCenterByUser';
import SelectItem from '@/components/BizSelect/SelectItem'; 
import { StudentInformationManagementList } from '@/actions/stuService';
//学生详情
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents'; 
import Edit from './Edit';


class ExclusiveUniformManagement extends React.Component {
        constructor(){
            super()
            this.onSearch = onSearch.bind(this);
            this.loadBizDictionary = loadBizDictionary.bind(this);
            this.onPageIndexChange = onPageIndexChange.bind(this);
            this.onShowSizeChange = onShowSizeChange.bind(this);
            this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
            this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
            this.onToggleSearchOption = onToggleSearchOption.bind(this);
            this.state = { 
                pagingSearch:{
                    pageSize:10,
                    currentPage:1,
                    teachCenterId:'',
                    itemId:'',
                    courseCategoryId:'', 
                    certificateNo:'',
                    studentName:'',
                    studyUniversityEnterYear:'',
                    universityName:'',
                    havePrivateTeacher:'',
                    privateTeacherStartDate:'',
                    privateTeacherEndDate:'',
                    mobile:'',
                    createDate:'',
                    privateTeacherName:'',
                    orderCreateDateStart:'',
                    orderCreateDateEnd:''
                },
                UserSelecteds:[]
            }
        } 
        componentWillMount(){ 
            this.loadBizDictionary(['sex'])
        }   
        fetch = (params = {}) => { 
            var condition = params || this.state.pagingSearch;  
            let firstDate = condition.privateTeacherStartDate;
            if(Array.isArray(firstDate)){
                condition.privateTeacherStartDate = formatMoment(firstDate[0]);
                condition.privateTeacherEndDate = formatMoment(firstDate[1]);
            } 
            let num = /^\d{4}$/;
            let onOff = num.test(condition.studyUniversityEnterYear);
            if(condition.studyUniversityEnterYear){
                if(!onOff)return message.warning('入学年份必须为四位纯数字');
            }
            // if(!condition.realName && !condition.mobile)return message.warning('至少输入一个查询条件!');
            this.setState({ loading: true });
            this.props.StudentInformationManagementList(condition).payload.promise.then((response) => {
                let data = response.payload.data; 
                    if(data.state == 'success'){
                        this.setState({
                            data_list:data.data,
                            pagingSearch: condition,
                            totalRecord: data.totalRecord,
                        })
                    }else{
                        message.error(data.msg)
                    }
                    this.setState({
                        loading:false
                    })
                }
            ) 
        }
        columns = [
            {
                title:'教学点',
                fixed:'left',
                dataIndex:'teacherCenterName', 
                width:'120'
            },
            {
                title:'学生姓名',
                dataIndex:'studentName', 
                width:'120',
                render: (text, record, index) => {
                    return <span>
                        <a href="javascript:;" onClick={() => { this.onLookView('oldViewStudentDetail', record); }}>{text}</a>
                    </span>
                }
            }, 
            {
                title:'入学年份',
                dataIndex:'studyUniversityEnterYear', 
                width:'120'
            },
            {
                title:'就读高校',
                dataIndex:'universityName', 
                width:'120'
            },
            {
                title:'订单项目',
                dataIndex:'itemName',  
            },
            {
                title:'最新订单日期',
                dataIndex:'createDate', 
                width:'160',
                render:(text,record)=>{
                    return timestampToTime(record.createDate)
                }
            },
            {
                title:'性别',
                dataIndex:'gender', 
                width:'120',
                render:(text,record)=>{
                    return getDictionaryTitle(this.state.sex,record.gender)
                }
            },
            {
                title:'证件号码',
                dataIndex:'certificateNo', 
                width:'160'
            },
            {
                title:'手机号', 
                dataIndex:'mobile', 
                width:'120'
            },
            {
                title:'微信号',
                dataIndex:'weixin', 
                width:'120'
            },
            {
                title:'QQ号',
                dataIndex:'qq', 
                width:'120'
            },
            {
                title:'设置日期',
                dataIndex:'privateTeacherDate', 
                width:'120',
                render:(text,record)=>{
                    return timestampToTime(record.privateTeacherDate)
                }
            },
            {
                title:'操作',
                dataIndex:'', 
                width:'120',
                fixed:'right',
                render:(text,record)=>{
                    return <Button onClick = {()=>this.onLookView('edit',record)}>编辑</Button>
                }
            },
        ] 
        //浏览视图
        onLookView = (op, item) => {
            this.setState({
                editMode: op,//编辑模式
                currentDataModel: item,//编辑对象
            });
    
        };
        onViewCallback = (dataModel, editMode) => { 
            if(!dataModel){ 
              this.setState({ currentDataModel: null, editMode: editMode || 'Manage' })
            }else{
              this.onSearch()
              this.setState({ currentDataModel: null, editMode: editMode || 'Manage' })
            }
        }

        render(){

            const { getFieldDecorator } = this.props.form;
            let black_content = <div></div>;
            switch(this.state.editMode){
                case 'oldViewStudentDetail':
                    black_content = <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel.studentId} />
                    break;
                case 'edit':
                    black_content = <Edit 
                    viewCallback={this.onViewCallback}
                    {...this.state}
                    />
                break; 
                default: 
                    const prefixSelector = getFieldDecorator('textKey',{
                        initialValue:dataBind(this.state.pagingSearch.textKey || 'studentName'),
                    })(
                        <Select style={{width:80}}> 
                            <Option value='studentName'>姓名</Option>
                            <Option value='mobile'>手机号</Option>
                            <Option value='qq'>证件号</Option>
                            <Option value='orderSn'>订单号</Option> 
                        </Select>
                    )
                    black_content = (<div>
                        <ContentBox topButton={this.renderSearchTopButtons()} bottomButton={this.renderSearchBottomButtons()}>
                            {!this.state.seachOptionsCollapsed && 
                                <Form
                                    className='search-form'
                                >
                                    <Row gutter = {24} type='flex'>
                                        <Col span={12}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label={'教学点'}
                                            >
                                            {getFieldDecorator('teachCenterId', { initialValue: this.state.pagingSearch.teachCenterId })(
                                                <SelectTeachCenterByUser />
                                            )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'项目'}>
                                                {getFieldDecorator('itemId', {
                                                initialValue: this.state.pagingSearch.itemId
                                                })(
                                                <SelectItem
                                                    scope={'my'}
                                                    hideAll={true}
                                                    hidePleaseSelect={true}
                                                    isFirstSelected={true}
                                                    onSelectChange={(value) => {
                                                        this.state.pagingSearch.itemId = value;
                                                        this.state.pagingSearch.courseCategoryId = '';
                                                        this.setState({ pagingSearch: this.state.pagingSearch });
                                                        setTimeout(() => {
                                                            {/* 重新重置科目项 */ }
                                                            this.props.form.resetFields(['courseCategoryId']);
                                                            this.onSearch();
                                                        }, 500);
                                                    }}
                                                    />
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label={'多条件查询'}
                                            >
                                                {getFieldDecorator('textValue',{
                                                    initialValue:this.state.pagingSearch.textValue
                                                })(
                                                    <Input placeholder='请输入查询条件' addonBefore={prefixSelector} />
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label={'入学年份'}
                                            >
                                                {getFieldDecorator('studyUniversityEnterYear',{initialValue:this.state.pagingSearch.studyUniversityEnterYear})(
                                                    <Input placeholder='请输入入学年份' />
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label={'就读高校'}
                                            >
                                                {getFieldDecorator('universityName',{initialValue:this.state.pagingSearch.universityName})(
                                                    <Input placeholder='请输入高校名称' />
                                                )}
                                            </FormItem>
                                        </Col>  
                                        <Col span={12}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label={'学服设置日期'}
                                            >
                                                {getFieldDecorator('privateTeacherStartDate', { initialValue: this.state.pagingSearch.privateTeacherStartDate?[moment(this.state.pagingSearch.privateTeacherStartDate,dateFormat),moment(this.state.pagingSearch.privateTeacherEndDate,dateFormat)]:[] })(
                                                    <RangePicker style={{width:220}}/>
                                                )}
                                            </FormItem>
                                        </Col> 
                                    </Row>
                                </Form>
                            }
                        </ContentBox>
                        <div className='space-default'></div>
                        <div className='search-result-list'>
                            <Table 
                                columns = {this.columns}
                                loading = {this.state.loading}
                                pagination = {false}
                                dataSource = {this.state.data_list}
                                bordered
                                rowKey={record=>record.studentPayfeeId}
                                scroll={{x:1800}}
                                rowClassName={record=>record.zbPayeeTypeIsEquals == false?'highLight_column':''}
                            />
                            <div className='space-default'></div>
                            <div calssName='search-paging'>
                                <Row justify="space-between" align="middle" type="flex"> 
                                </Row>
                                <Row justify="end" align="middle" type="flex">
                                    <Col span={24} className='search-paging-control'>
                                        <Pagination 
                                            showSizeChanger
                                            current = {this.state.pagingSearch.currentPage}
                                            defaultPageSize = {this.state.pagingSearch.pageSize}
                                            pageSize = {this.state.pagingSearch.pageSize}
                                            onShowSizeChange = {this.onShowSizeChange}
                                            onChange = {this.onPageIndexChange}
                                            showTotal = {(total)=>{ return `共${total}条数据`;}}
                                            total = {this.state.totalRecord}
                                            pageSizeOptions = {['10','20','30','50','100','200']}
                                        /> 
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </div>)
                break;
            }
            return black_content; 
        }
}


const WrappedManage = Form.create()(ExclusiveUniformManagement);
const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
}

function mapDispatchToProps(dispatch){
    return {
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        StudentInformationManagementList: bindActionCreators(StudentInformationManagementList, dispatch),
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(WrappedManage);