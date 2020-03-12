//标准组件环境  回访情况 
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider, Modal } from 'antd';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, convertTextToHtml } from '@/utils';

//业务接口方法引入
import ContentBox from '@/components/ContentBox';
import DropDownButton from '@/components/DropDownButton';
import { returnVisitStudentSelectByStudentId } from '@/actions/stuService';


class ReturnVisit extends React.Component {
    state = {
        currentDataModel: null,
        loading: false,
        data: [],
        dataModel: {},
        pagingSearch: {
            currentPage: 1,
            pageSize: 10,
        },
        totalRecord: 0,
    };

    constructor() {
        super()
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onToggleSearchOption = onToggleSearchOption.bind(this);
        this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
        this.onSearch = onSearch.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);
    }
    
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary([]);
        this.onSearch();
    }
    componentWillUnMount() {
    }


    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;

        condition.studentId = this.props.studentId;

        this.props.returnVisitStudentSelectByStudentId(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                this.setState({
                    data: data.data,
                    totalRecord: data.totalRecord,
                    loading: false
                })
            }
            else {
                this.setState({ loading: false, data: [] })
                message.error(data.message);
            }
        })
    }

    //浏览视图
    onLookView = (op, item) => {
        
        this.setState({
            editMode: op,//编辑模式
            dataModel: item,//编辑对象
        });
    };
     //视图回调
     onViewCallback = (dataModel) => {
        if (!dataModel) {
            this.setState({ dataModel: null, editMode: 'Manage' })
        }
        else {
            switch (this.state.editMode) {
                
            }
        }
    }

    //渲染，根据模式不同控制不同输出
    render() {
        const { getFieldDecorator } = this.props.form;
        let block_content_1 = <div></div>;
        switch (this.state.editMode) {
            
            case "Manage":
            default:
                block_content_1 =
                <ContentBox titleName='回访情况' hideBottomBorder={false}>
                    <div className="dv_split"></div>
                    {
                        this.state.data.length ? <div style={{width:'100%',padding:'0 20px'}}>
                            <Form>
                                {
                                    this.state.data.map((item) => {
                                        return <Row gutter={24}  style={{border:'1px solid #c8c8c8'}}>
                                            <div style={{lineHeight:'40px',background:'yellow'}}>{ item.itemName }&nbsp;&nbsp;{item.taskName}</div>
                                            <div style={{lineHeight:'40px',background:'yellow'}}>回访要点：{ item.remark }</div>
                                            {
                                                item.returnVisitStudentVo.map((data) => {
                                                    return <div>
                                                        <p style={{lineHeight:'50px',borderLeft:'none',borderRight:'none'}}>{timestampToTime(data.returnVisitDate)}&nbsp;&nbsp;{data.createUserName}&nbsp;&nbsp;{data.visitType}&nbsp;&nbsp;【回访日期+回访老师+回访方式】</p>
                                                            <Col span={24} style={{paddingTop:10}}>
                                                                <FormItem
                                                                    {...searchFormItemLayout24}
                                                                    label="回访要点"
                                                                >
                                                                    { data.returnVisitContent }
                                                                </FormItem>
                                                            </Col>
                                                    </div>
                                                })
                                            }
                                            
                                        </Row>
                                    })
                                }
                                
                            </Form>
                            
                        </div>
                    : '暂无数据'
                }
                <div className="dv_split"></div>
                <div className="search-paging">
                    <Row justify="space-between" align="middle" type="flex">
                    <Col span={24} className={'search-paging-control'}>
                        <Pagination showSizeChanger
                        current={this.state.pagingSearch.currentPage}
                        defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
                        pageSize={this.state.pagingSearch.pageSize}
                        onShowSizeChange={this.onShowSizeChange}
                        onChange={this.onPageIndexChange}
                        showTotal={(total) => { return `共${total}条数据`; }}
                        total={this.state.totalRecord} />
                    </Col>
                    </Row>
                </div>
                <div className="dv_split"></div>
                </ContentBox>
                break;
        }
        

        let block_content = <div>
            {block_content_1}

        </div>

        return block_content;
    }
}
//表单组件 封装
const WrappedReturnVisit = Form.create()(ReturnVisit);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        returnVisitStudentSelectByStudentId:bindActionCreators(returnVisitStudentSelectByStudentId, dispatch),//根据学生id查询科目学习情况接口
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedReturnVisit);
