import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Form,Table,Row,Col,Pagination,Button, message } from 'antd';
import SearchForm from '@/components/SearchForm';
import { timestampToTime, getDictionaryTitle,formatMoment } from '@/utils';
import { loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange } from '@/utils/componentExt';
import { InquiryOnTheOpeningScheduleList } from '@/actions/course';
import CoursePlanView from '../CoursePlanAudit/view';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
class CourseplanManageFB extends React.Component{
    constructor(){
        super()
        this.state = {
            data_list:[],
            loading:false,
            pagingSearch:{
                itemId:'',
                courseplanBatchId:'',
                courseCategoryId:'',
                courseplanName:'',
                isPilot:'',
                intentTeacher:'',
                currentPage:1,
                pageSize:10
            }, 
        } 
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);
        this.onSearch = onSearch.bind(this);
    }
    componentWillMount(){
        this.loadBizDictionary(['dic_YesNo','is_new_student']);
        // this.onSearch();
    }
    fetch = (params) => {
        var condition = params || this.state.pagingSearch;  
        this.setState({ loading: true });
        this.props.InquiryOnTheOpeningScheduleList(condition).payload.promise.then((response) => {
            let data = response.payload.data; 
            if(data.state == 'success'){
                this.setState({
                    pagingSearch: condition,
                    data_list: data.data,
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
          title: '教学点',
          width:120,
          fixed:'left',
          dataIndex: 'teachCenterName',
        },
        {
          title: '课程班名称',
          width:120,
          dataIndex: 'courseplanName',
        },
        {
          title: '课程班类型',
          width:120,
          dataIndex: 'teachClassTypeName',
        },
        {
          title: '预估考季',
          width:120,
          dataIndex: 'examBatchName',
        },
        {
          title: '科目',
          width:120,
          dataIndex: 'courseCategoryName'
        },
        {
          title: '意向讲师',
          width:100,
          dataIndex: 'intentTeacher'
        },
        {
          title: '课时备注',
          width:80,
          dataIndex: 'classHour'
        },
        {
          title: '教服试点',
          width:80,
          dataIndex: 'isPilot',
          render:(text,record)=>{
              return getDictionaryTitle(this.state.dic_YesNo,record.isPilot)
          }
        },
        {
          title: '开课日期',
          dataIndex: 'startDate',
          width:120,
          render: (text, record, index) => {
            return timestampToTime(record.startDate);
          }
        },
        {
          title: '结课日期',
          dataIndex: 'endDate',
          width:120,
          render: (text, record, index) => {
            return timestampToTime(record.endDate);
          }
        },
        {
          title: '预估开课人数（不含重修）',
          width:160,
          dataIndex: 'planStudentNum',
          render: (text, record) => {
            return <span>{record.planStudentNum}</span>
          } 
        }, 
        {
          title: '可排课日期',
          dataIndex: 'timeQuantum',
          render: (text, record, index) => {
            return timestampToTime(record.timeQuantum);
          }
        }, 
        {
          title: '状态',
          width:90,
          dataIndex: 'statusName'
        },
        {
          title: '是否新生班',
          width:90,
          dataIndex: 'isNewStudent',
          render:(text,record)=>{ 
            return getDictionaryTitle(this.state.is_new_student,record.isNewStudent)
          }
        },
        {
          title: '创建人',
          width:90,
          dataIndex: 'createName'
        },
        {
          title: '手机',
          width:90,
          dataIndex: 'createNameMobile'
        },
        {
          title: '提交日期',
          width:90,
          dataIndex: 'createDate',
          render: (text, record, index) => {
            return timestampToTime(record.createDate);
          }
        },
        {
          title: '操作',
          width: '120',
          fixed:'right',
          key: 'action',
          render: (text, record) => (
            <Button onClick={() => { this.onLookView('searchView', record) }}>查看</Button>
          ),
        }
      ];
    onViewCallback= (dataModel) => { 
        this.setState({ currentDataModel: null, editMode: 'Manage' })
    }
    onLookView = (op,item) =>{
        this.setState({
            editMode:op,
            currentDataModel:item
        })
    }
    render(){
        let block_content = <div></div>

        switch(this.state.editMode){
            case 'searchView': 
                block_content = <CoursePlanView
                viewCallback={this.onViewCallback}
                {...this.state}
                //editMode={this.state.editMode}
                />
            break;
            case 'Manage':
            default:
                block_content = (
                    <div>
                    <SearchForm
                        num_column={2}
                        isItemUser={true}
                        isCoursePlanBatch={true}
                        isCourseCategory={true}
                        isMain={true}
                        isTeachCenter={true}
                        isYesNo={true}
                        isTeachClassType={true}
                        isCoursePlanAuditStatus={true}
                        form_item_list={[
                        { type: 'select', data: 'item', name: 'itemId', title: '项目', value: this.state.pagingSearch.itemId, is_all: false },
                        { type: 'select', data: 'course_plan_batch', name: 'courseplanBatchId', title: '开课批次', value: this.state.pagingSearch.courseplanBatchId, is_all: false },
                        { type: 'select', data: 'course_category', name: 'courseCategoryId', title: '科目', value: this.state.pagingSearch.courseCategoryId, is_all: true },
                        { type: 'select', data: 'teach_center', name: 'teachCenterId', title: '教学点', value: this.state.pagingSearch.teachCenterId, is_all: true },
                        { type: 'select', data: 'dic_YesNo', name: 'isPilot', title: '是否教服试点', value: this.state.pagingSearch.isPilot, is_all: true },  
                        { type: 'input', name: 'courseplanName', title: '课程班名称', value: this.state.pagingSearch.courseplanName },
                        { type: 'input', name: 'intentTeacher', title: '意向讲师', value: this.state.pagingSearch.intentTeacher }, 
                        {}
                        ]}
                        fetch2={(params) => this.fetch(params)}
                        pagingSearch={this.state.pagingSearch}
                        extendButtons={[
                          {
                            title: '导出', type: 'export',
                            url: '/edu/courseplan/exportCourseplanList'
                          },
                        ]}
                    />
                    <div className="space-default"></div>
                    {/* {
                        this.state.data_list.length ?
                            <div style={{ color: "ff0000" }}>项目{this.state.data_list[0].itemName}{this.state.data_list[0].courseplanBatchName}开课计划提交截止日期：{timestampToTime(this.state.data_list[0].courseBatchEndDate)}，请抓紧时间！</div>
                            : <div></div>
                        } */}
                        <span style={{color:'red'}}>课时备注1小时/1课时</span>
                    <div style={{height:20}}></div>
                    <div className="search-result-list">
                        <Table columns={this.columns} //列定义
                        loading={this.state.loading}
                        pagination={false}
                        dataSource={this.state.data_list}//数据
                        scroll={{x:2000}}
                        bordered
                        />
                        <div className="space-default"></div>
                        <div className="search-paging">
                        <Row justify="space-between" align="middle" type="flex">
                            <Col span={24} className={'search-paging-control'}>
                            <Pagination showSizeChanger
                                current={this.state.pagingSearch.currentPage}
                                defaultPageSize={this.state.pagingSearch.pageSize}
                                pageSizeOptions = {['10','20','30','50','100','200']}
                                pageSize={this.state.pagingSearch.pageSize}
                                onShowSizeChange={this.onShowSizeChange}
                                onChange={this.onPageIndexChange}
                                showTotal={(total) => { return `共${total}条数据`; }}
                                total={this.state.totalRecord} />
                            </Col>
                        </Row>
                        </div>
                    </div>
                    </div>
                )
                break;
        }
        return block_content
    }
} 

const WrappedManage  = Form.create()(CourseplanManageFB);

const mapStateToProps = (state) => {
    let { Dictionarys } = state.dic;
    return { Dictionarys }
}

function mapDispatchToProps(dispatch){
    return {
        loadDictionary:bindActionCreators(loadDictionary,dispatch),
        InquiryOnTheOpeningScheduleList:bindActionCreators(InquiryOnTheOpeningScheduleList, dispatch),
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(WrappedManage)