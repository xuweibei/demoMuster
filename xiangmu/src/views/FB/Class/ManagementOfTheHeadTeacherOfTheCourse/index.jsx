import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
import { Form,Row,Col,Select,Input,Table,Pagination,Button, message } from 'antd';
const FormItem = Form.Item;
import  ContentBox from '@/components/ContentBox';
import { getDictionaryTitle } from '@/utils';
import { searchFormItemLayout,loadBizDictionary, renderSearchTopButtons, renderSearchBottomButtons,onSearch,onToggleSearchOption,onPageIndexChange,onShowSizeChange } from '@/utils/componentExt';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectItemCoursePlanBatch from '@/components/BizSelect/SelectItemCoursePlanBatch';
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';
import SelectTeachCenterByUser from '@/components/BizSelect/SelectTeachCenterByUser';
import { TeacherOfTheCourseList } from '@/actions/course';
import Views from './View';
import Details from './Details';



class Management extends React.Component{
    constructor(){
        super();
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onToggleSearchOption = onToggleSearchOption.bind(this);
        this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);
        this.onSearch = onSearch.bind(this);
        this.state = {
            totalRecord:0,
            editMode:'',
            pagingSearch:{
                currentPage:1,
                pageSize:10,
                itemId:'',
                courseCategoryId:'', 
                teachCenterId:'',
                teachClassType:'',
                courseplanName:'',
                classTeacherName:'',
                haveClassTeacher:'',
                isNewStudent:'',
                courseplanId:''
            },
            UserSelecteds:[],
            loading:false,
            data_list:[]
        }
    }
    componentWillMount(){
        this.loadBizDictionary(['teach_class_type'])
    }
    fetch = ( params = {}) => {
        this.setState({loading:true});
        var condition = params || this.state.pagingSearch;
        this.props.TeacherOfTheCourseList(condition).payload.promise.then((response)=>{
            let data = response.payload.data; 
            if(data.state == 'success'){
                this.setState({
                    pagingSearch: condition,
                    data_list:data.data,
                    totalRecord: data.totalRecord
                })
            }else{
                message.error(data.msg);
            }
            this.setState({
                loading:false
            })
        })
    }
    columns = [
        {
            title: '教学点',
            width: 180,
            fixed: 'left',
            dataIndex: 'teacherCenterName'
        },
        {
            title: '课程班',
            width: 180, 
            dataIndex: 'courseplanName'
        },
        {
            title: '班主任',
            width: 180, 
            dataIndex: 'classTeacherName'
        },
        {
            title: '工号',
            width: 180, 
            dataIndex: 'loginName'
        },
        {
            title: '课程班类型',
            width: 180, 
            dataIndex: 'teachClassType',
            render:(text,record)=>{
                return getDictionaryTitle(this.state.teach_class_type,record.teachClassType)
            }
        },
        {
            title: '预估考季',
            width: 180, 
            dataIndex: 'examBatchName'
        },
        {
            title: '科目',
            width: 180, 
            dataIndex: 'courseCategoryName'
        },
        {
            title: '意向讲师',
            width: 180, 
            dataIndex: 'intentTeacher'
        },
        {
            title: '课时备注',
            width: 180, 
            dataIndex: 'classHour'
        },
        {
            title: '预估开课人数(不含重修)',
            width: 180, 
            dataIndex: 'planStudentNum'
        },
        {
            title: '实际学生数',
            width: 180, 
            dataIndex: 'studentNum'
        },
        {
            title: '是否新生班',
            width: 180, 
            dataIndex: 'isNewStudent'
        },
        {
            title: '操作',
            width: 180,
            fixed: 'right',
            render:(text,record)=>{
                return <Button onClick = {()=>{ this.onLookView('Details',record)}}>查看</Button>
            }
        }
    ]
    onLookView = ( op,item ) => {
        this.setState({
            editMode:op,
            currentDataModel:item
        })
    }
    setTeachers = () => {
        let onOff = false;  
        this.state.selectDataList.forEach((item,index)=>{ 
            if(this.state.selectDataList[index+1]){
                if(item.teacherCenterName != this.state.selectDataList[index+1].teacherCenterName){
                    onOff = true;
                }
            }
        }) 
        if(onOff)return message.warning('所选教学点不一致！') 
        this.setState({
            editMode:'Teacher'
        })
    }
      //视图回调
    onViewCallback = (data) => { 
        if(data){
            this.onSearch(); 
            this.setState({
                currentDataModel: null, 
                editMode: 'Manage',
                UserSelecteds:[],
                selectDataList:[],
                selectedRowKeys:[]
            })
        }else{
            this.setState({ currentDataModel: null, editMode: 'Manage' }) 
        }
    }

    render(){ 
        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>;
        switch(this.state.editMode){
            case 'Details': 
                block_content = <Details viewCallback={this.onViewCallback} {...this.state}/>
                break; 
            case 'View':
            case 'Teacher':
                block_content = <Views viewCallback={this.onViewCallback} {...this.state}/>
                break; 
            case "Manage":
            default:  
                const rowSelection  = {
                    onChange:(selectedRowKeys,selectedRows)=>{ 
                        this.setState({
                            UserSelecteds:selectedRowKeys,
                            selectDataList:selectedRows,
                            selectedRowKeys
                        })
                    },
                    getCheckboxProps:record=>({
                        
                    }),
                    selectedRowKeys:this.state.UserSelecteds
                }
                let extendButtons = [];
                block_content = (<div>
                    <ContentBox topButton = {this.renderSearchTopButtons()} bottomButton = {this.renderSearchBottomButtons()}>
                        {
                            !this.state.seachOptionsCollapsed && 
                                <Form
                                    className = 'search-form'
                                >
                                    <Row justify = 'center' gutter={24} align='middle' tylpe='flex'>
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
                                                            this.state.pagingSearch.courseplanId = '';
                                                            this.state.pagingSearch.itemId = value; 
                                                            this.setState({ pagingSearch: this.state.pagingSearch });
                                                            // this.onSearch();
                                                            setTimeout(() => {
                                                                {/* 重新重置才能绑定这个开课批次值 */ }
                                                                this.props.form.resetFields(['courseplanId']);
                                                            }, 1000);
                                                        }} />
                                                )
                                            }
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'开课批次'}>
                                            {getFieldDecorator('courseplanId', {
                                                    initialValue: this.state.pagingSearch.courseplanId
                                                })(
                                                    <SelectItemCoursePlanBatch hideAll={true} isFirstSelected={true}
                                                        itemId={this.state.pagingSearch.itemId}
                                                        onSelectChange={(value, selectedOptions) => {
                                                            this.state.pagingSearch.courseplanId = value;
                                                            let currentCoursePlanBatch = selectedOptions;
                                                            this.setState({ pagingSearch: this.state.pagingSearch, currentCoursePlanBatch });
                                                            this.onSearch();
                                                        }}
                                                    />
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12} >
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label="科目"
                                            >
                                                {getFieldDecorator('courseCategoryId', { initialValue: this.state.pagingSearch.courseCategoryId })(
                                                    <SelectItemCourseCategory itemId={this.state.pagingSearch.itemId} hideAll={false} isMain={true}/>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                                <FormItem {...searchFormItemLayout} label={'是否新生班'}>
                                                    {getFieldDecorator('isNewStudent',{ initialValue:this.state.pagingSearch.isNewStudent})(
                                                        <Select>
                                                            <Option value=''>全部</Option>
                                                            <Option value='1'>是</Option>
                                                            <Option value='0'>否</Option>
                                                        </Select>
                                                    )}
                                                </FormItem>
                                        </Col>
                                        <Col span={12} >
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label="教学点"
                                            >
                                                {getFieldDecorator('teachCenterId', { initialValue: this.state.pagingSearch.teachCenterId })(
                                                    <SelectTeachCenterByUser />
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'课程班类型'}>
                                                {getFieldDecorator('teachClassType',{ initialValue: this.state.pagingSearch.teachClassType})(
                                                    <Select>
                                                        <Option value=''>全部</Option>
                                                        {
                                                            this.state.teach_class_type.map(item=>{
                                                                return <Option value={item.value}>{item.title}</Option>
                                                            })
                                                        }
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'课程班'}>
                                                {getFieldDecorator('courseplanName',{ initialValue:this.state.pagingSearch.courseplanName})(
                                                    <Input placeholder='请输入课程班' />
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'班主任姓名'}>
                                                {getFieldDecorator('classTeacherName',{ initialValue:this.state.pagingSearch.classTeacherName})(
                                                    <Input placeholder='请输入班主任姓名' />
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'班主任设置情况'}>
                                                {getFieldDecorator('haveClassTeacher',{ initialValue:this.state.pagingSearch.haveClassTeacher})(
                                                    <Select>
                                                        <Option value=''>全部</Option>
                                                        <Option value='1'>已设置</Option>
                                                        <Option value='0'>未设置</Option>
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </Col>
                                    </Row>
                                </Form>
                        }
                    </ContentBox>
                    
                    {/* 内容分割线 */}
                    <div className="space-default"></div>
                    <div className="search-result-list">
                        <Table columns={this.columns} //列定义
                            loading={this.state.loading}
                            pagination={false}
                            dataSource={this.state.data_list}//数据
                            bordered
                            scroll={{ x: 2400 }}
                            rowSelection = {rowSelection}
                        />
                        <div className="space-default"></div>
                        <div className="search-paging">
                            <Row justify="end" align="middle" type="flex">
                                <Col span={2}> 
                                    {
                                        this.state.UserSelecteds.length ?
                                        <Button loading={this.state.loading} icon="align-center" onClick = {()=>{this.setTeachers()}}>批量设置班主任</Button>
                                        :
                                        <Button icon="align-center" disabled>批量设置班主任</Button>
                                    }
                                </Col> 
                                <Col span={22} className='search-paging-control'>
                                    <Pagination showSizeChanger
                                        current={this.state.pagingSearch.currentPage}
                                        defaultPageSize={this.state.pagingSearch.pageSize}     
                                        pageSizeOptions = {['10','20','30','50','100','200']}
                                        onShowSizeChange={this.onShowSizeChange}
                                        onChange={this.onPageIndexChange}
                                        showTotal={(total) => { return `共${total}条数据`; }}
                                        total={this.state.totalRecord} />
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>)

        }
        return block_content;
    }
}

const WrappedCourseManage = Form.create()(Management);

const mapStateToProps = (state) => {
    let { Dictionarys } = state.dic;
    return { Dictionarys };
}

function mapDispatchToProps(dispatch){
    return {
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        TeacherOfTheCourseList:bindActionCreators(TeacherOfTheCourseList,dispatch)
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(WrappedCourseManage)